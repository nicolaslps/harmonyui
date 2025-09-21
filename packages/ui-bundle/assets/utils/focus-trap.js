import { FocusableManager } from './focusable.js';

export class FocusTrap {
	constructor(container, options = {}) {
		this.container = container;
		this.options = {
			initialFocus: options.initialFocus || 'first',
			returnFocus: options.returnFocus !== false,
			escapeDeactivates: options.escapeDeactivates !== false,
			clickOutsideDeactivates: options.clickOutsideDeactivates !== false,
			...options
		};

		this.isActive = false;
		this.previousActiveElement = null;
		this.focusableManager = new FocusableManager(container);

		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}

	activate() {
		if (this.isActive) return this;

		this.previousActiveElement = document.activeElement;

		this.focusableManager.refresh();

		document.addEventListener('keydown', this.handleKeydown);
		if (this.options.clickOutsideDeactivates) {
			document.addEventListener('click', this.handleClick);
		}

		this.setInitialFocus();

		this.isActive = true;
		return this;
	}

	deactivate() {
		if (!this.isActive) return this;

		document.removeEventListener('keydown', this.handleKeydown);
		document.removeEventListener('click', this.handleClick);

		if (this.options.returnFocus && this.previousActiveElement) {
			this.previousActiveElement.focus();
		}

		this.isActive = false;
		this.previousActiveElement = null;
		return this;
	}

	setInitialFocus() {
		const { initialFocus } = this.options;

		setTimeout(() => {
			if (initialFocus === 'first') {
				this.focusableManager.focusFirst();
			} else if (initialFocus === 'last') {
				this.focusableManager.focusLast();
			} else if (initialFocus && typeof initialFocus.focus === 'function') {
				initialFocus.focus();
			} else if (this.focusableManager.hasFocusableElements) {
				this.focusableManager.focusFirst();
			} else {
				this.container.focus();
			}
		}, 10);
	}

	handleKeydown(event) {
		if (!this.isActive) return;

		if (event.key === 'Escape' && this.options.escapeDeactivates) {
			event.preventDefault();
			this.deactivate();
			return;
		}

		if (event.key === 'Tab') {
			this.handleTabKey(event);
		}
	}

	handleTabKey(event) {
		this.focusableManager.refresh();

		const { firstElement, lastElement, hasFocusableElements } = this.focusableManager;

		if (!hasFocusableElements) {
			event.preventDefault();
			return;
		}

		const isShiftTab = event.shiftKey;
		const activeElement = document.activeElement;

		if (isShiftTab) {
			if (activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			}
		} else {
			if (activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		}
	}

	handleClick(event) {
		if (!this.isActive) return;

		if (!this.container.contains(event.target)) {
			event.preventDefault();
			this.deactivate();
		}
	}

	refresh() {
		this.focusableManager.refresh();
		return this;
	}

	updateContainer(newContainer) {
		this.container = newContainer;
		this.focusableManager = new FocusableManager(newContainer);
		return this;
	}

	get active() {
		return this.isActive;
	}

	get focusableCount() {
		return this.focusableManager.count;
	}
}

export function createFocusTrap(container, options = {}) {
	return new FocusTrap(container, options);
}