import { LitElement, html, css, nothing } from 'lit';

const drawerRegistry = new Map();
let drawerCounter = 0;

class HuiDrawer extends LitElement {
	static styles = css`
		dialog {
			position: fixed;
			margin: 0;
			padding: 0;
			border: none;
			background: var(--background, white);
			transition: transform 300ms ease-out;
			max-width: none;
			overflow: auto;
		}

		:host([data-position="bottom"]) dialog,
		:host(:not([data-position])) dialog {
			bottom: 0 !important;
			left: 0 !important;
			right: 0 !important;
			top: auto !important;
			margin: 0 !important;
			border-radius: 10px 10px 0 0;
			border-top: 1px solid var(--border, #e5e7eb);
			transform: translateY(100%);
			max-height: 80vh;
		}

		:host([data-position="bottom"]) dialog[open],
		:host(:not([data-position])) dialog[open] {
			transform: translateY(0);
		}

		:host([data-position="top"]) dialog {
			top: 0 !important;
			left: 0 !important;
			right: 0 !important;
			bottom: auto !important;
			margin: 0 !important;
			border-radius: 0 0 10px 10px;
			border-bottom: 1px solid var(--border, #e5e7eb);
			transform: translateY(-100%);
			max-height: 80vh;
		}

		:host([data-position="top"]) dialog[open] {
			transform: translateY(0);
		}

		:host([data-position="left"]) dialog {
			top: 0 !important;
			left: 0 !important;
			bottom: 0 !important;
			right: auto !important;
			margin: 0 !important;
			width: 320px;
			border-radius: 0 10px 10px 0;
			border-right: 1px solid var(--border, #e5e7eb);
			transform: translateX(-100%);
			max-width: 320px;
		}

		:host([data-position="left"]) dialog[open] {
			transform: translateX(0);
		}

		:host([data-position="right"]) dialog {
			top: 0 !important;
			right: 0 !important;
			bottom: 0 !important;
			left: auto !important;
			margin: 0 !important;
			width: 320px;
			border-radius: 10px 0 0 10px;
			border-left: 1px solid var(--border, #e5e7eb);
			transform: translateX(100%);
			max-width: 320px;
		}

		:host([data-position="right"]) dialog[open] {
			transform: translateX(0);
		}

		dialog::backdrop {
			background: rgba(0, 0, 0, 0.8);
			transition: opacity 300ms ease-out;
		}
	`;

	static properties = {
		open: { type: Boolean, reflect: true }
	};

	constructor() {
		super();
		this.drawerId = ++drawerCounter;
	}

	connectedCallback() {
		super.connectedCallback();
		drawerRegistry.set(this.drawerId, this);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		drawerRegistry.delete(this.drawerId);
	}

	updated(changedProperties) {
		if (changedProperties.has('open')) {
			const dialog = this.shadowRoot.querySelector('dialog');
			if (this.open) {
				dialog.showModal();
			} else {
				dialog.close();
			}
		}
	}

	handleDialogClose = () => {
		this.open = false;
	}

	handleDialogClick = (event) => {
		if (event.target.tagName === 'DIALOG') {
			const rect = event.target.getBoundingClientRect();
			const isClickOutside = (
				event.clientY < rect.top ||
				event.clientY > rect.bottom ||
				event.clientX < rect.left ||
				event.clientX > rect.right
			);
			if (isClickOutside) {
				this.closeDrawer();
			}
		}
	}

	openDrawer() {
		this.open = true;
	}

	closeDrawer() {
		this.open = false;
	}

	toggle() {
		this.open = !this.open;
	}

	getDrawerOrder() {
		return Array.from(drawerRegistry.keys()).indexOf(this.drawerId);
	}

	isTopDrawer() {
		const openDrawers = Array.from(drawerRegistry.values()).filter(drawer => drawer.open);
		return openDrawers[openDrawers.length - 1] === this;
	}

	render() {
		return html`
			<dialog @close=${this.handleDialogClose} @click=${this.handleDialogClick}>
				<slot></slot>
			</dialog>
		`;
	}
}

customElements.define('hui-drawer', HuiDrawer);

export { HuiDrawer, drawerRegistry };