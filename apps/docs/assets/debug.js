import { computePosition, flip, offset, shift, arrow, hide, autoPlacement, autoUpdate } from '@floating-ui/dom';

class HuiFloatingElement extends HTMLElement {
    constructor() {
        super();
        this.trigger = null;
        this.contentTarget = null;
        this.cleanup = null;
        this.isAnimating = false;
        this.updatePosition = this.updatePosition.bind(this);
    }

    connectedCallback() {
        this.setupTrigger();
        this.setupEventListeners();
        this.setupFloatingBehavior();
    }

    disconnectedCallback() {
        this.cleanupEventListeners();
        this.stopAutoUpdate();
    }

    setupTrigger() {
        const elementId = this.id;
        if (elementId) {
            this.trigger = this.findTrigger(elementId);
        }
        this.contentTarget = this;
    }

    findTrigger(elementId) {
        return document.querySelector(`[popovertarget="${elementId}"]`) ||
            document.querySelector(`[data-target="${elementId}"]`) ||
            document.querySelector(`[aria-controls="${elementId}"]`);
    }

    setupEventListeners() {
        this.addEventListener('toggle', (event) => {
            if (event.newState === 'open') {
                this.startAutoUpdate();
            } else {
                this.stopAutoUpdate();
            }
        });

        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    cleanupEventListeners() {
        this.stopAutoUpdate();
    }

    startAutoUpdate() {
        if (!this.trigger || this.cleanup) return;

        if (this.hasAttribute('data-lock')) {
            console.log('Lock screen - popover opened');
        }

        this._handleOpenAnimation();

        this.cleanup = autoUpdate(
            this.trigger,
            this,
            this.updatePosition
        );

    }

    async stopAutoUpdate() {
        if (this.hasAttribute('data-lock')) {
            console.log('Unlock screen - popover closed');
        }

        await this._handleCloseAnimation();

        if (this.cleanup) {
            this.cleanup();
            this.cleanup = null;
        }
    }

    async _handleOpenAnimation() {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            return Promise.resolve();
        }

        this.removeAttribute('data-closed');
        this.setAttribute('data-enter', '');
        this.setAttribute('data-transition', '');

        await this._nextFrame();

        const duration = this._getTransitionDuration(this);
        setTimeout(() => {
            this.removeAttribute('data-enter');
            this.removeAttribute('data-transition');
            this.setAttribute('data-open', '');
        }, duration || 200);
    }

    async _handleCloseAnimation() {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            return Promise.resolve();
        }

        this.removeAttribute('data-open');
        this.setAttribute('data-leave', '');
        this.setAttribute('data-transition', '');
        this.setAttribute('data-closed', '');

        await this._nextFrame();

        const duration = this._getTransitionDuration(this);
        setTimeout(() => {
            this.removeAttribute('data-leave');
            this.removeAttribute('data-transition');
        }, duration || 200);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, duration || 200);
        });
    }

    async _nextFrame() {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });
    }

    _getTransitionDuration(element) {
        if (!element) return 200;

        const computedStyle = getComputedStyle(element);
        const transitionDuration = computedStyle.transitionDuration;
        const transitionDelay = computedStyle.transitionDelay;

        const parseDuration = (duration) => {
            if (!duration || duration === '0s') return 0;
            return parseFloat(duration) * (duration.includes('ms') ? 1 : 1000);
        };

        const duration = parseDuration(transitionDuration);
        const delay = parseDuration(transitionDelay);

        return duration + delay;
    }


    setupFloatingBehavior() {
        this.setAttribute('popover', '');
        this.setAttribute('data-closed', '');
    }

    handleOutsideClick(event) {
        if (this.hasAttribute('popover') && this.matches(':popover-open')) {
            if (!this.contains(event.target) && !this.trigger?.contains(event.target)) {
                this.hidePopover();
            }
        }
    }

    async updatePosition(event, data) {
        if (!this.matches(':popover-open')) return;

        const trigger = data?.target ?? this.trigger;
        if (!trigger) return;

        const placement = this.getAttribute('data-position') || 'bottom';
        const flipEnabled = this.hasAttribute('data-flip');
        const shiftEnabled = this.hasAttribute('data-shift');
        const hideEnabled = this.hasAttribute('data-hide');
        const autoPlacementEnabled = this.hasAttribute('data-auto-placement');
        const baseGap = parseInt(this.getAttribute('data-gap')) || 4;
        const arrowElement = this.querySelector('[data-slot="arrow"]');

        let totalGap = baseGap;
        if (arrowElement && placement) {
            const arrowRect = arrowElement.getBoundingClientRect();
            const placementSide = placement.split('-')[0];

            if (placementSide === 'top' || placementSide === 'bottom') {
                totalGap += arrowRect.height;
            } else if (placementSide === 'left' || placementSide === 'right') {
                totalGap += arrowRect.width;
            }
        }

        const middleware = [];

        if (autoPlacementEnabled) {
            middleware.push(
                autoPlacement({ crossAxis: true })
            );
        } else {
            middleware.push(offset(totalGap));
            if (flipEnabled) middleware.push(flip());
            if (shiftEnabled) middleware.push(shift({ padding: 5 }));
            if (hideEnabled) middleware.push(hide());
        }

        if (arrowElement) {
            middleware.push(arrow({ element: arrowElement }));
        }



        computePosition(trigger, this, {
            placement: autoPlacementEnabled ? 'bottom' : placement,
            strategy: 'fixed',
            middleware: middleware,
        }).then((result) => {
            this.style.position = 'fixed';
            this.style.left = `${result.x}px`;
            this.style.top = `${result.y}px`;

            if (hideEnabled && result.middlewareData.hide) {
                const { referenceHidden, escaped } = result.middlewareData.hide;

                if (referenceHidden || escaped) {
                    this.close();
                    return;
                }
            }

            const side = result.placement;
            this.setAttribute('data-side', side);
            if (arrowElement && result.middlewareData.arrow) {
                const arrowSide = side.split('-')[0];
                const { x, y } = result.middlewareData.arrow;

                Object.assign(arrowElement.style, {
                    left: x != null ? `${x}px` : '',
                    top: y != null ? `${y}px` : '',
                    position: 'absolute'
                });

                arrowElement.setAttribute('data-side', arrowSide);
            }
        });

        this.style.visibility = 'visible';
    }


    isOpen() {
        return this.matches(':popover-open');
    }

    async open() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.showPopover();

        await new Promise(resolve => {
            const checkAnimation = () => {
                if (!this.hasAttribute('data-enter') && !this.hasAttribute('data-transition')) {
                    this.isAnimating = false;
                    resolve();
                } else {
                    requestAnimationFrame(checkAnimation);
                }
            };
            checkAnimation();
        });
    }

    async close() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        await this.stopAutoUpdate();

        this.hidePopover();
        this.isAnimating = false;
    }

    toggle() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }
}

customElements.define('hui-popover', HuiFloatingElement);
