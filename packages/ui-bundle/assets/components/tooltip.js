import { arrow, autoUpdate, computePosition, flip, hide, offset, shift } from '@floating-ui/dom';

class HuiTooltip extends HTMLElement {
	constructor() {
		super();
		this.trigger = null;
		this.contentTarget = null;
		this.cleanup = null;
		this.isAnimating = false;
		this.showTimeout = null;
		this.hideTimeout = null;
		this._updatePosition = this._updatePosition.bind(this);
		this._handleMouseEnter = this._handleMouseEnter.bind(this);
		this._handleMouseLeave = this._handleMouseLeave.bind(this);
		this._handleFocus = this._handleFocus.bind(this);
		this._handleBlur = this._handleBlur.bind(this);
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
		return (
			document.querySelector(`[data-tooltip="${elementId}"]`) ||
			document.querySelector(`[data-target="${elementId}"]`) ||
			document.querySelector(`[aria-describedby="${elementId}"]`)
		);
	}

	_setupEventListeners() {
		if (!this.trigger) return;

		this.trigger.addEventListener('mouseenter', this._handleMouseEnter);
		this.trigger.addEventListener('mouseleave', this._handleMouseLeave);
		this.trigger.addEventListener('focus', this._handleFocus);
		this.trigger.addEventListener('blur', this._handleBlur);

		this.addEventListener('mouseenter', () => {
			clearTimeout(this.hideTimeout);
		});

		this.addEventListener('mouseleave', this._handleMouseLeave);
	}

	_cleanupEventListeners() {
		if (this.trigger) {
			this.trigger.removeEventListener('mouseenter', this._handleMouseEnter);
			this.trigger.removeEventListener('mouseleave', this._handleMouseLeave);
			this.trigger.removeEventListener('focus', this._handleFocus);
			this.trigger.removeEventListener('blur', this._handleBlur);
		}
		this._stopAutoUpdate();
		clearTimeout(this.showTimeout);
		clearTimeout(this.hideTimeout);
	}

	_handleMouseEnter() {
		clearTimeout(this.hideTimeout);
		const delay = parseInt(this.getAttribute('delay')) || 200;
		this.showTimeout = setTimeout(() => {
			this.open();
		}, delay);
	}

	_handleMouseLeave() {
		clearTimeout(this.showTimeout);
		this.hideTimeout = setTimeout(() => {
			this.close();
		}, 150);
	}

	_handleFocus() {
		clearTimeout(this.hideTimeout);
		this.open();
	}

	_handleBlur() {
		clearTimeout(this.showTimeout);
		this.close();
	}

	_startAutoUpdate() {
		if (!this.trigger || this.cleanup) return;

		this.style.visibility = 'hidden';
		this.removeAttribute('data-closed');
		this.contentTarget = this.querySelector('[data-slot="content"]') || this;
		this.contentTarget.setAttribute('data-closed', '');
		this.isInitialOpen = true;

		this.cleanup = autoUpdate(this.trigger, this, this._updatePosition);
	}

	async _stopAutoUpdate() {
		await this._handleCloseAnimation();

		if (this.cleanup) {
			this.cleanup();
			this.cleanup = null;
		}
	}

	async _handleOpenAnimation() {
		const skipAnimations =
			this._skipAnimations() || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

		this.contentTarget.removeAttribute('data-closed');
		this.contentTarget.setAttribute('data-enter', '');
		this.contentTarget.setAttribute('data-transition', '');

		if (skipAnimations) {
			const animations = this.contentTarget.getAnimations();
			animations.forEach((animation) => {
				animation.currentTime = animation.effect.getComputedTiming().duration;
			});
		}

		await new Promise((resolve) => requestAnimationFrame(resolve));

		const animations = this.contentTarget.getAnimations();
		if (animations.length > 0) {
			await Promise.all(animations.map((animation) => animation.finished));
		}

		this.contentTarget.removeAttribute('data-enter');
		this.contentTarget.removeAttribute('data-transition');
		this.contentTarget.setAttribute('data-open', '');
	}

	async _handleCloseAnimation() {
		const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

		this.contentTarget.removeAttribute('data-open');
		this.contentTarget.setAttribute('data-leave', '');
		this.contentTarget.setAttribute('data-transition', '');

		if (reduceMotion) {
			const animations = this.getAnimations({ subtree: true });
			animations.forEach((animation) => {
				animation.currentTime = animation.effect.getComputedTiming().duration;
			});
		}

		const animations = this.getAnimations({ subtree: true });
		if (animations.length > 0) {
			await Promise.all(animations.map((animation) => animation.finished));
		}

		this.contentTarget.removeAttribute('data-leave');
		this.contentTarget.removeAttribute('data-transition');
		this.contentTarget.setAttribute('data-closed', '');
	}

	_setupFloatingBehavior() {
		this.setAttribute('popover', 'manual');
		const contentTarget = this.querySelector('[data-slot="content"]') || this;
		contentTarget.setAttribute('data-closed', '');
	}

	async _updatePosition(event, data) {
		if (!this.matches(':popover-open')) return;

		const trigger = data?.target ?? this.trigger;
		if (!trigger) return;

		const placement = this.getAttribute('position') || 'top';
		const avoidCollisions = this.hasAttribute('avoidCollisions');
		const stickyEnabled = this.hasAttribute('sticky');
		const hideWhenDetached = this.hasAttribute('hideWhenDetached');
		const baseGap = parseInt(this.getAttribute('sideOffset')) || 4;
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
				let { x, y } = result.middlewareData.arrow;
				if (stickyEnabled) {
					const arrowRect = arrowElement.getBoundingClientRect();
					const tooltipRect = this.getBoundingClientRect();
					const computedStyle = window.getComputedStyle(this.contentTarget);
					const borderRadius = parseFloat(computedStyle.borderRadius);

					if (arrowSide === 'top' || arrowSide === 'bottom') {
						const minX = borderRadius;
						const maxX = tooltipRect.width - arrowRect.width - borderRadius;
						if (maxX >= minX) {
							x = Math.max(minX, Math.min(x, maxX));
						} else {
							x = (tooltipRect.width - arrowRect.width) / 2;
						}
					} else if (arrowSide === 'left' || arrowSide === 'right') {
						const minY = borderRadius;
						const maxY = tooltipRect.height - arrowRect.height - borderRadius;
						if (maxY >= minY) {
							y = Math.max(minY, Math.min(y, maxY));
						} else {
							y = (tooltipRect.height - arrowRect.height) / 2;
						}
					}
				}

				Object.assign(arrowElement.style, {
					left: x != null ? `${x}px` : '',
					top: y != null ? `${y}px` : '',
					position: 'absolute',
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

	_skipAnimations() {
		const tooltipGroup = this.closest('[data-slot="tooltip-group"]');
		if (tooltipGroup) {
			const openTooltips = tooltipGroup.querySelectorAll('hui-tooltip:popover-open');
			if (openTooltips.length > 1) {
				return true;
			}
		}
		return false;
	}

	async open() {
		if (this.isAnimating || this.matches(':popover-open')) return;
		this.isAnimating = true;

		this.showPopover();
		this._startAutoUpdate();

		const animations = this.getAnimations({ subtree: true });
		if (animations.length > 0) {
			await Promise.all(animations.map((animation) => animation.finished));
		}

		this.isAnimating = false;
	}

	async close() {
		if (this.isAnimating || !this.matches(':popover-open')) return;
		this.isAnimating = true;

		await this._stopAutoUpdate();

		this.hidePopover();
		this.isAnimating = false;
	}

	toggle() {
		if (this.matches(':popover-open')) {
			this.close();
		} else {
			this.open();
		}
	}
}

customElements.define('hui-tooltip', HuiTooltip);
