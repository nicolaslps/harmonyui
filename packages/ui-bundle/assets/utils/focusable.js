export const FOCUSABLE_SELECTORS = [
	'button:not([disabled])',
	'[href]',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable]',
	'details > summary',
	'audio[controls]',
	'video[controls]'
].join(', ');

export function isElementVisible(element) {
	if (!element) return false;

	const style = window.getComputedStyle(element);
	return (
		style.display !== 'none' &&
		style.visibility !== 'hidden' &&
		style.opacity !== '0' &&
		element.offsetWidth > 0 &&
		element.offsetHeight > 0
	);
}

export function isElementFocusable(element) {
	if (!element || element.disabled) return false;

	if (!isElementVisible(element)) return false;

	const tabindex = element.getAttribute('tabindex');
	if (tabindex === '-1') return false;

	return true;
}

export function getFocusableElements(container, selectors = FOCUSABLE_SELECTORS) {
	if (!container) return [];

	const elements = Array.from(container.querySelectorAll(selectors));
	return elements.filter(isElementFocusable);
}

export function getFirstFocusableElement(container, selectors = FOCUSABLE_SELECTORS) {
	const elements = getFocusableElements(container, selectors);
	return elements[0] || null;
}

export function getLastFocusableElement(container, selectors = FOCUSABLE_SELECTORS) {
	const elements = getFocusableElements(container, selectors);
	return elements[elements.length - 1] || null;
}

export function focusElement(element, fallback = null) {
	if (element && isElementFocusable(element)) {
		element.focus();
		return true;
	}

	if (fallback && isElementFocusable(fallback)) {
		fallback.focus();
		return true;
	}

	return false;
}

export class FocusableManager {
	constructor(container, selectors = FOCUSABLE_SELECTORS) {
		this.container = container;
		this.selectors = selectors;
		this.elements = [];
		this.firstElement = null;
		this.lastElement = null;
		this.refresh();
	}

	refresh() {
		this.elements = getFocusableElements(this.container, this.selectors);
		this.firstElement = this.elements[0] || null;
		this.lastElement = this.elements[this.elements.length - 1] || null;
		return this;
	}

	focusFirst() {
		return focusElement(this.firstElement, this.container);
	}

	focusLast() {
		return focusElement(this.lastElement, this.container);
	}

	get count() {
		return this.elements.length;
	}

	get hasFocusableElements() {
		return this.elements.length > 0;
	}
}