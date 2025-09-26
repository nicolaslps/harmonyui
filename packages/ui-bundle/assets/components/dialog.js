import { screenLock } from '../utils/screen-lock';

class HuiDialog extends HTMLElement {
	constructor() {
		super();
		this._handleBackdropClick = this._handleBackdropClick.bind(this);
		this._handleKeyDown = this._handleKeyDown.bind(this);
		this.dialog = null;
		this.panel = null;
	}

	connectedCallback() {
		this.dialog = this.querySelector('dialog');
		if (!this.dialog) return;
		this.panel = this.querySelector('[data-slot="panel"]');

		this.dialog.addEventListener('click', this._handleBackdropClick);
		this.dialog.addEventListener('keydown', this._handleKeyDown);

		const form = this.dialog.querySelector('form[method="dialog"]');
		if (form) {
			form.addEventListener('submit', async (event) => {
				event.preventDefault();
				await this.hide();
			});
		}

		this.dialog.addEventListener('close', () => {
			screenLock.unlock();
		});

		this.dialog.setAttribute('role', 'dialog');
		this.dialog.setAttribute('aria-modal', 'true');

		this._handleInitialState();

		if (this.hasAttribute('open')) {
			this.show();
		}
	}

	disconnectedCallback() {
		if (!this.dialog) return;
		this.dialog.removeEventListener('click', this._handleBackdropClick);
		this.dialog.removeEventListener('keydown', this._handleKeyDown);
	}

	_handleInitialState() {
		if (!this.dialog) return;
		const isOpen = this.dialog.hasAttribute('data-open');
		if (isOpen) {
			this.show();
		}
	}

	async _handleBackdropClick(event) {
		if (event.target !== this.dialog || this._isAlertDialog()) {
			return;
		}
		if (this.panel?.contains(event.target)) {
			return;
		}
		await this.hide();
	}

	_handleKeyDown(event) {
		if (event.key === 'Escape' && this.dialog && this.dialog.open) {
			if (this._isAlertDialog()) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			this.hide();
		}
	}

	_isAlertDialog() {
		return this.dialog.getAttribute('type') === 'alert';
	}

	_getTransitionDuration(element) {
		if (!element) return 0;

		const computedStyle = window.getComputedStyle(element);
		const duration = computedStyle.transitionDuration;
		const durations = duration.split(',').map((d) => {
			const trimmed = d.trim();
			if (trimmed.endsWith('ms')) {
				return parseFloat(trimmed);
			} else if (trimmed.endsWith('s')) {
				return parseFloat(trimmed) * 1000;
			}
			return 0;
		});

		return Math.max(...durations, 0);
	}

	_nextFrame() {
		return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
	}

	async _handleOpenAnimation() {
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
			return Promise.resolve();
		}
		if (!this.dialog) return;

		const elements = [this.dialog, this.panel];

		elements.forEach((el) => {
			el.removeAttribute('data-closed');
			el.setAttribute('data-enter', '');
			el.setAttribute('data-transition', '');
		});

		await this._nextFrame();

		elements.forEach((el) => {
			const duration = this._getTransitionDuration(el);
			setTimeout(() => {
				el.removeAttribute('data-enter');
				el.removeAttribute('data-transition');
			}, duration || 200);
		});
	}

	async _handleCloseAnimation() {
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
			return Promise.resolve();
		}
		if (!this.dialog) return Promise.resolve();
		const elements = [this.dialog, this.panel];

		elements.forEach((el) => {
			el.setAttribute('data-leave', '');
			el.setAttribute('data-transition', '');
			el.setAttribute('data-closed', '');
		});

		await this._nextFrame();

		elements.forEach((el) => {
			const duration = this._getTransitionDuration(el);
			setTimeout(() => {
				el.removeAttribute('data-leave');
				el.removeAttribute('data-transition');
			}, duration || 200);
		});

		const dialogDuration = this._getTransitionDuration(this.dialog);
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, dialogDuration || 200);
		});
	}

	show() {
		if (!this.dialog) return;
		screenLock.lock();
		this.dialog.showModal();
		this._handleOpenAnimation();
	}

	async hide() {
		if (!this.dialog || !this.dialog.open) return;
		await this._handleCloseAnimation();
		this.dialog.close();
		screenLock.unlock();
	}
}

customElements.define('hui-dialog', HuiDialog);

function handleDialogAction(attribute, action) {
	document.addEventListener('click', async (event) => {
		const trigger = event.target.closest(`[${attribute}]`);
		if (!trigger) return;

		const dialogId = trigger.getAttribute(attribute);
		const dialog = document.querySelector(`#${dialogId}`);

		if (!dialog) {
			console.warn(`Dialog with id "${dialogId}" not found`);
			return;
		}

		const huiDialog = dialog.closest('hui-dialog');
		if (!huiDialog) {
			console.warn(`Dialog "${dialogId}" is not inside a hui-dialog component`);
			return;
		}

		if (action === 'show') {
			if (!customElements.get('hui-dialog')) {
				await customElements.whenDefined('hui-dialog');
			}
			if (!huiDialog.dialog) {
				await new Promise((resolve) => setTimeout(resolve, 50));
			}
		}

		if (typeof huiDialog[action] === 'function') {
			huiDialog[action]();
		}
	});
}
handleDialogAction('data-dialog-show', 'show');
handleDialogAction('data-drawer-show', 'show');
handleDialogAction('data-dialog-close', 'hide');
handleDialogAction('data-drawer-close', 'hide');
