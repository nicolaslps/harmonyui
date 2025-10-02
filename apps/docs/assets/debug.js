import { computePosition, flip, offset, shift, arrow, hide, autoUpdate } from '@floating-ui/dom';

class HuiFloatingElement extends HTMLElement {
    constructor() {
        super();
        this.trigger = null;
        this.contentTarget = null;
        this.cleanup = null;
        this.isAnimating = false;
        this._updatePosition = this._updatePosition.bind(this);
    }

    connectedCallback() {
        this._setupTrigger();
        this._setupEventListeners();
        this._setupFloatingBehavior();
    }

    disconnectedCallback() {
        this._cleanupEventListeners();
        this._stopAutoUpdate();
    }

    _setupTrigger() {
        const elementId = this.id;
        if (elementId) {
            this.trigger = this._findTrigger(elementId);
        }
        this.contentTarget = this;
    }

    _findTrigger(elementId) {
        return document.querySelector(`[popovertarget="${elementId}"]`) ||
            document.querySelector(`[data-target="${elementId}"]`) ||
            document.querySelector(`[aria-controls="${elementId}"]`);
    }

    _setupEventListeners() {
        this.addEventListener('toggle', (event) => {
            if (event.newState === 'open') {
                this._startAutoUpdate();
            } else {
                this._stopAutoUpdate();
            }
        });

        document.addEventListener('click', this._handleOutsideClick.bind(this));
    }

    _cleanupEventListeners() {
        this._stopAutoUpdate();
    }

    _startAutoUpdate() {
        if (!this.trigger || this.cleanup) return;

        if (this.hasAttribute('data-screen-lock')) {
            console.log('Lock screen - popover opened');
        }

        this.style.visibility = 'hidden';
        this.setAttribute('data-state', 'open');
        this.contentTarget = this.querySelector('[data-slot="content"]') || this;
        this.arrowTarget = this.querySelector('[data-slot="arrow"]');
        this.contentTarget.setAttribute('data-state', 'closed');
        if (this.arrowTarget) {
            this.arrowTarget.setAttribute('data-state', 'closed');
        }
        this.isInitialOpen = true;

        this.cleanup = autoUpdate(
            this.trigger,
            this,
            this._updatePosition
        );

    }

    async _stopAutoUpdate() {
        if (this.hasAttribute('data-screen-lock')) {
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

        this.contentTarget.setAttribute('data-state', 'open');

    }

    async _handleCloseAnimation() {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            return Promise.resolve();
        }

        this.contentTarget.setAttribute('data-state', 'closed');

        if (this.arrowTarget) {
            this.arrowTarget.setAttribute('data-state', 'closed');
        }

        const duration = this._getTransitionDuration(this.contentTarget);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, duration || 200);
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


    _setupFloatingBehavior() {
        this.setAttribute('popover', '');
        const contentTarget = this.querySelector('[data-slot="content"]') || this;
        const arrowTarget = this.querySelector('[data-slot="arrow"]');
        contentTarget.setAttribute('data-state', 'closed');
        if (arrowTarget) {
            arrowTarget.setAttribute('data-state', 'closed');
        }
    }

    _handleOutsideClick(event) {
        if (this.hasAttribute('popover') && this.matches(':popover-open')) {
            if (!this.contains(event.target) && !this.trigger?.contains(event.target)) {
                this.hidePopover();
            }
        }
    }

    async _updatePosition(event, data) {
        if (!this.matches(':popover-open')) return;

        const trigger = data?.target ?? this.trigger;
        if (!trigger) return;

        const placement = this.getAttribute('data-position') || 'bottom';
        const avoidCollisions = this.hasAttribute('avoidCollisions');
        const stickyEnabled = this.hasAttribute('data-sticky');
        const hideWhenDetached = this.hasAttribute('hideWhenDetached');
        const baseGap = parseInt(this.getAttribute('data-side-offset')) || 4;
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
        middleware.push(offset(totalGap));
        if (avoidCollisions) middleware.push(flip());
        if (stickyEnabled) middleware.push(shift({ padding: 5 }));
        if (hideWhenDetached) middleware.push(hide());

        if (arrowElement) {
            middleware.push(arrow({ element: arrowElement }));
        }

        computePosition(trigger, this, {
            placement: placement,
            strategy: 'fixed',
            middleware: middleware,
        }).then((result) => {
            this.style.position = 'fixed';
            this.style.left = `${result.x}px`;
            this.style.top = `${result.y}px`;

            if (hideWhenDetached && result.middlewareData.hide) {
                const { referenceHidden, escaped } = result.middlewareData.hide;

                if (referenceHidden || escaped) {
                    this.close();
                    return;
                }
            }

            const side = result.placement;
            this.setAttribute('data-side', side);
            this.contentTarget.setAttribute('data-side', side);
            if (this.arrowTarget) {
                this.arrowTarget.setAttribute('data-side', side);
            }

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
        if (this.isInitialOpen) {
            this.isInitialOpen = false;
            this._handleOpenAnimation();
        }
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
                if (this.contentTarget.getAttribute('data-state') === 'open') {
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

        await this._stopAutoUpdate();

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
