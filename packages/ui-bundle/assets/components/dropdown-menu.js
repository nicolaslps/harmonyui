import { arrow, autoUpdate, computePosition, flip, hide, offset, shift } from '@floating-ui/dom';
import { screenLock } from '../utils/screen-lock';

class HuiDropdownMenu extends HTMLElement {
	constructor() {
		super();
		this.trigger = null;
		this.contentTarget = null;
		this.cleanup = null;
		this.isAnimating = false;
		this.currentFocusIndex = -1;
		this.menuItems = [];
		this._updatePosition = this._updatePosition.bind(this);
		this._handleKeyDown = this._handleKeyDown.bind(this);
		this._handleTriggerKeyDown = this._handleTriggerKeyDown.bind(this);
		this._handleItemClick = this._handleItemClick.bind(this);
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
			document.querySelector(`[popovertarget="${elementId}"]`) ||
			document.querySelector(`[data-target="${elementId}"]`) ||
			document.querySelector(`[aria-controls="${elementId}"]`)
		);
	}

	_setupEventListeners() {
		if (this.trigger) {
			this.trigger.addEventListener('keydown', this._handleTriggerKeyDown);
		}

		this.addEventListener('toggle', (event) => {
			if (event.newState === 'open') {
				this._startAutoUpdate();
			} else {
				this._stopAutoUpdate();
			}
		});

		this.addEventListener('keydown', this._handleKeyDown);
		document.addEventListener('click', this._handleOutsideClick.bind(this));
	}

	_cleanupEventListeners() {
		if (this.trigger) {
			this.trigger.removeEventListener('keydown', this._handleTriggerKeyDown);
		}
		this._stopAutoUpdate();
	}

	_handleTriggerKeyDown(event) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			this.open();
			requestAnimationFrame(() => {
				this._focusFirstItem();
			});
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			this.open();
			requestAnimationFrame(() => {
				this._focusFirstItem();
			});
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			this.open();
			requestAnimationFrame(() => {
				this._focusLastItem();
			});
		}
	}

	_handleKeyDown(event) {
		if (!this.matches(':popover-open')) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				this._focusNextItem();
				break;
			case 'ArrowUp':
				event.preventDefault();
				this._focusPreviousItem();
				break;
			case 'Home':
				event.preventDefault();
				this._focusFirstItem();
				break;
			case 'End':
				event.preventDefault();
				this._focusLastItem();
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				this._activateCurrentItem();
				break;
			case 'Escape':
				event.preventDefault();
				this.close();
				this.trigger?.focus();
				break;
			case 'Tab':
				event.preventDefault();
				this.close();
				this.trigger?.focus();
				break;
		}
	}

	_getMenuItems() {
		return Array.from(this.querySelectorAll('[data-slot="menu-item"]')).filter(
			(item) => !item.hasAttribute('disabled') && !item.hasAttribute('aria-disabled')
		);
	}

	_focusFirstItem() {
		this.menuItems = this._getMenuItems();
		if (this.menuItems.length > 0) {
			this.currentFocusIndex = 0;
			this.menuItems[0].focus();
		}
	}

	_focusLastItem() {
		this.menuItems = this._getMenuItems();
		if (this.menuItems.length > 0) {
			this.currentFocusIndex = this.menuItems.length - 1;
			this.menuItems[this.currentFocusIndex].focus();
		}
	}

	_focusNextItem() {
		this.menuItems = this._getMenuItems();
		if (this.menuItems.length === 0) return;

		this.currentFocusIndex = (this.currentFocusIndex + 1) % this.menuItems.length;
		this.menuItems[this.currentFocusIndex].focus();
	}

	_focusPreviousItem() {
		this.menuItems = this._getMenuItems();
		if (this.menuItems.length === 0) return;

		this.currentFocusIndex = this.currentFocusIndex <= 0 ? this.menuItems.length - 1 : this.currentFocusIndex - 1;
		this.menuItems[this.currentFocusIndex].focus();
	}

	_activateCurrentItem() {
		this.menuItems = this._getMenuItems();
		if (this.currentFocusIndex >= 0 && this.currentFocusIndex < this.menuItems.length) {
			const currentItem = this.menuItems[this.currentFocusIndex];
			currentItem.click();
		}
	}

	_handleItemClick(event) {
		const item = event.target.closest('[data-slot="menu-item"]');
		if (item && !item.hasAttribute('disabled') && !item.hasAttribute('aria-disabled')) {
			this.close();
			this.trigger?.focus();
		}
	}

	_startAutoUpdate() {
		if (!this.trigger || this.cleanup) return;

		screenLock.lock();

		this.style.visibility = 'hidden';
		this.removeAttribute('data-closed');
		this.contentTarget = this.querySelector('[data-slot="content"]') || this;
		this.contentTarget.setAttribute('data-closed', '');
		this.isInitialOpen = true;

		const items = this.querySelectorAll('[data-slot="menu-item"]');
		items.forEach((item) => {
			item.addEventListener('click', this._handleItemClick);
		});

		this.cleanup = autoUpdate(this.trigger, this, this._updatePosition);
	}

	async _stopAutoUpdate() {
		screenLock.unlock();

		await this._handleCloseAnimation();

		const items = this.querySelectorAll('[data-slot="menu-item"]');
		items.forEach((item) => {
			item.removeEventListener('click', this._handleItemClick);
		});

		if (this.cleanup) {
			this.cleanup();
			this.cleanup = null;
		}

		this.currentFocusIndex = -1;
		this.menuItems = [];
	}

	async _handleOpenAnimation() {
		const skipAnimations = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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

	_handleOutsideClick(event) {
		if (this.hasAttribute('popover') && this.matches(':popover-open')) {
			if (!this.contains(event.target) && !this.trigger?.contains(event.target)) {
				this.close();
			}
		}
	}

	async _updatePosition(_event, data) {
		if (!this.matches(':popover-open')) return;

		const trigger = data?.target ?? this.trigger;
		if (!trigger) return;

		const placement = this.getAttribute('position') || 'bottom-start';
		const avoidCollisions = this.hasAttribute('avoidCollisions');
		const stickyEnabled = this.hasAttribute('sticky');
		const hideWhenDetached = this.hasAttribute('hideWhenDetached');
		const baseGap = parseInt(this.getAttribute('sideOffset'), 10) || 4;
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
					const menuRect = this.getBoundingClientRect();
					const computedStyle = window.getComputedStyle(this.contentTarget);
					const borderRadius = parseFloat(computedStyle.borderRadius);

					if (arrowSide === 'top' || arrowSide === 'bottom') {
						const minX = borderRadius;
						const maxX = menuRect.width - arrowRect.width - borderRadius;
						if (maxX >= minX) {
							x = Math.max(minX, Math.min(x, maxX));
						} else {
							x = (menuRect.width - arrowRect.width) / 2;
						}
					} else if (arrowSide === 'left' || arrowSide === 'right') {
						const minY = borderRadius;
						const maxY = menuRect.height - arrowRect.height - borderRadius;
						if (maxY >= minY) {
							y = Math.max(minY, Math.min(y, maxY));
						} else {
							y = (menuRect.height - arrowRect.height) / 2;
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

	async open() {
		if (this.isAnimating) return;
		this.isAnimating = true;

		this.showPopover();

		const animations = this.getAnimations({ subtree: true });
		if (animations.length > 0) {
			await Promise.all(animations.map((animation) => animation.finished));
		}

		this.isAnimating = false;
	}

	async close() {
		if (this.isAnimating) return;
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

customElements.define('hui-dropdown-menu', HuiDropdownMenu);
