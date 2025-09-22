import { screenLock } from '../utils/screen-lock.js';

class HuiDialog extends HTMLElement {
	constructor() {
		super();
		this.handleBackdropClick = this.handleBackdropClick.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.dialog = null;
	}

	connectedCallback() {
		this.dialog = this.querySelector('dialog');
		if (!this.dialog) return;

		this.dialog.addEventListener('click', this.handleBackdropClick);
		this.dialog.addEventListener('keydown', this.handleKeyDown);
		this.dialog.addEventListener('close', () => {
			screenLock.unlock();
		});

		this.dialog.setAttribute('role', 'dialog');
		this.dialog.setAttribute('aria-modal', 'true');

		this.updateAnimationAttributes();

		if (this.hasAttribute('open')) {
			this.open();
		}
	}

	disconnectedCallback() {
		if (this.dialog) {
			this.dialog.removeEventListener('click', this.handleBackdropClick);
			this.dialog.removeEventListener('keydown', this.handleKeyDown);
		}
	}

	handleBackdropClick(event) {
		if (event.target === this.dialog && !this.isAlertDialog()) {
			this.close();
		}
	}

	handleKeyDown(event) {
		if (event.key === 'Escape' && this.dialog && this.dialog.open) {
			if (this.isAlertDialog()) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			this.close();
		}
	}

	isAlertDialog() {
		return this.getAttribute('data-type') === 'alert';
	}

	updateAnimationAttributes() {
		if (!this.dialog) return;

		const isOpen = this.dialog.open;

		if (isOpen) {
			this.dialog.removeAttribute('data-closed');
		} else {
			this.dialog.setAttribute('data-closed', '');
		}
	}

	handleOpenAnimation() {
		if (!this.dialog) return;

		this.dialog.removeAttribute('data-closed');
		this.dialog.setAttribute('data-enter', '');
		this.dialog.setAttribute('data-transition', '');

		setTimeout(() => {
			this.dialog.removeAttribute('data-enter');
			this.dialog.removeAttribute('data-transition');
		}, 200);
	}

	handleCloseAnimation() {
		if (!this.dialog) return;

		this.dialog.setAttribute('data-leave', '');
		this.dialog.setAttribute('data-transition', '');

		return new Promise((resolve) => {
			setTimeout(() => {
				if (this.dialog) {
					this.dialog.removeAttribute('data-leave');
					this.dialog.removeAttribute('data-transition');
					this.dialog.setAttribute('data-closed', '');
				}
				resolve();
			}, 200);
		});
	}

	open() {
		if (!this.dialog) return;
		this.dialog.showModal();
		screenLock.lock();
		this.handleOpenAnimation();
	}

	async close() {
		if (!this.dialog || !this.dialog.open) return;
		await this.handleCloseAnimation();
		this.dialog.close();
		screenLock.unlock();
	}

	static get observedAttributes() {
		return ['open'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'open') {
			if (newValue !== null) {
				this.open();
			} else {
				this.close();
			}
		}
	}
}

customElements.define('hui-dialog', HuiDialog);

document.addEventListener('click', async (event) => {
	const trigger = event.target.closest('[data-dialog]');
	if (!trigger) return;

	const dialogId = trigger.getAttribute('data-dialog');
	const action = trigger.getAttribute('data-action') || 'open';
	const dialog = document.querySelector(`#${dialogId}`);

	if (!dialog) {
		return;
	}

	if (!customElements.get('hui-dialog')) {
		await customElements.whenDefined('hui-dialog');
	}

	if (dialog.tagName === 'HUI-DIALOG' && !dialog.open) {
		await new Promise(resolve => setTimeout(resolve, 50));
	}

	if (typeof dialog.open !== 'function') {
		return;
	}

	switch (action) {
		case 'open':
			dialog.open();
			break;
		case 'close':
			dialog.close();
			break;
		case 'toggle':
			if (dialog.dialog && dialog.dialog.open) {
				dialog.close();
			} else {
				dialog.open();
			}
			break;
	}
});

export { HuiDialog };