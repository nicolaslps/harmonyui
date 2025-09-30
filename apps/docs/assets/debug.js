import { computePosition, flip, offset, shift, arrow } from '@floating-ui/dom';

class HuiPopover extends HTMLElement {
    constructor() {
        super();
        this.trigger = null;
        this.contentTarget = null;
        this.updatePosition = this.updatePosition.bind(this);
        this.handleOffScreen = this.handleOffScreen.bind(this);
    }

    connectedCallback() {
        const popoverId = this.id;
        if (popoverId) {
            this.trigger = document.querySelector(`[popovertarget="${popoverId}"]`);
        }
        this.contentTarget = this;

        this.setAttribute('popover', '');

        window.addEventListener('scroll', this.updatePosition);
        window.addEventListener('scroll', this.handleOffScreen);
        window.addEventListener('resize', this.updatePosition);

        this.addEventListener('toggle', (event) => {
            if (event.newState === 'open') {
                requestAnimationFrame(this.updatePosition);
            }
        });

        document.addEventListener('click', (event) => {
            if (this.hasAttribute('popover') && this.matches(':popover-open')) {
                if (!this.contains(event.target) && !this.trigger?.contains(event.target)) {
                    this.hidePopover();
                }
            }
        });
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.updatePosition);
        window.removeEventListener('scroll', this.handleOffScreen);
        window.removeEventListener('resize', this.updatePosition);
    }

    updatePosition(event, data) {
        if (!this.matches(':popover-open')) return;

        const trigger = data?.target ?? this.trigger;
        if (!trigger) return;

        const placement = this.getAttribute('data-position') || 'bottom';
        const flipEnabled = this.getAttribute('data-flip');
        const gap = parseInt(this.getAttribute('data-gap')) || 6;

        const arrowElement = this.querySelector('[data-slot="arrow"]');

        this.style.left = '';
        this.style.top = '';

        const middleware = [
            offset(gap),
            flipEnabled ? flip() : null,
            shift({ padding: 5 })
        ].filter(Boolean);

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
            this.style.zIndex = '1000';

            if (arrowElement && result.middlewareData.arrow) {
                const { x, y } = result.middlewareData.arrow;
                const side = result.placement.split('-')[0];

                Object.assign(arrowElement.style, {
                    left: x != null ? `${x}px` : '',
                    top: y != null ? `${y}px` : '',
                    position: 'absolute'
                });

                arrowElement.setAttribute('data-side', side);
            }
        });
    }

    handleOffScreen(event) {
        if (!this.matches(':popover-open')) return;

        if (!this.trigger) return;

        const triggerRect = this.trigger.getBoundingClientRect();
        if (triggerRect.bottom < 0 || triggerRect.top > window.innerHeight) {
            this.hidePopover();
        }
    }

    show() {
        this.showPopover();
        requestAnimationFrame(this.updatePosition);
    }

    hide() {
        this.hidePopover();
    }

    toggle() {
        if (this.matches(':popover-open')) {
            this.hide();
        } else {
            this.show();
        }
    }
}

customElements.define('hui-popover', HuiPopover);
