class HuiTabs extends HTMLElement {
	constructor() {
		super();
		this._handleTabClick = this._handleTabClick.bind(this);
		this._handleKeyDown = this._handleKeyDown.bind(this);
		this._handleTabFocus = this._handleTabFocus.bind(this);
		this.tabList = null;
		this.tabPanels = null;
		this.tabs = [];
		this.panels = [];
		this.activeTabIndex = 0;
		this.activation = 'automatic';
		this.orientation = 'horizontal';
	}

	connectedCallback() {
		this.tabList = this.querySelector('[data-slot="tab-list"]');
		this.tabPanels = this.querySelector('[data-slot="tab-panels"]');

		if (!this.tabList || !this.tabPanels) return;

		this.activation = this.getAttribute('data-activation') || 'automatic';
		this.orientation = this.getAttribute('orientation') || 'horizontal';

		this.tabs = Array.from(this.tabList.querySelectorAll('button'));
		this.panels = Array.from(this.tabPanels.children);

		this._initializeTabs();
		this._setupEventListeners();
		this._determineInitialActiveTab();
	}

	disconnectedCallback() {
		this.tabs.forEach((tab) => {
			tab.removeEventListener('click', this._handleTabClick);
			tab.removeEventListener('keydown', this._handleKeyDown);
			tab.removeEventListener('focus', this._handleTabFocus);
		});
	}

	_initializeTabs() {
		const baseId = this.id || `tabs-${Math.random().toString(36).substr(2, 9)}`;

		this.tabs.forEach((tab, index) => {
			tab.setAttribute('role', 'tab');
			tab.setAttribute('aria-controls', `${baseId}-panel-${index}`);
			tab.setAttribute('tabindex', index === this.activeTabIndex ? '0' : '-1');
			tab.id = tab.id || `${baseId}-tab-${index}`;
			tab.setAttribute('aria-selected', 'false');
		});

		this.panels.forEach((panel, index) => {
			panel.setAttribute('role', 'tabpanel');
			panel.setAttribute('aria-labelledby', `${baseId}-tab-${index}`);
			panel.id = panel.id || `${baseId}-panel-${index}`;
			panel.setAttribute('tabindex', '0');
		});

		if (this.tabList) {
			this.tabList.setAttribute('role', 'tablist');
			const label = this.getAttribute('aria-label');
			if (label) {
				this.tabList.setAttribute('aria-label', label);
			}
		}
	}

	_setupEventListeners() {
		this.tabs.forEach((tab) => {
			tab.addEventListener('click', this._handleTabClick);
			tab.addEventListener('keydown', this._handleKeyDown);
			if (this.activation === 'automatic') {
				tab.addEventListener('focus', this._handleTabFocus);
			}
		});
	}

	_determineInitialActiveTab() {
		const activePanel = this.panels.findIndex((panel) => !panel.hasAttribute('hidden'));
		if (activePanel !== -1) {
			this.activeTabIndex = activePanel;
		}
		this.setActiveTab(this.activeTabIndex);
	}

	_handleTabClick(event) {
		const clickedTab = event.currentTarget;
		const tabIndex = this.tabs.indexOf(clickedTab);
		if (tabIndex !== -1) {
			this.setActiveTab(tabIndex);
		}
	}

	_handleTabFocus(event) {
		if (this.activation === 'automatic') {
			const tabIndex = this.tabs.indexOf(event.currentTarget);
			if (tabIndex !== -1) {
				this.setActiveTab(tabIndex);
			}
		}
	}

	_handleKeyDown(event) {
		const currentIndex = this.tabs.indexOf(event.currentTarget);
		let newIndex = currentIndex;
		let shouldActivate = false;
		switch (event.key) {
			case 'ArrowRight':
				if (this.orientation === 'horizontal') {
					event.preventDefault();
					newIndex = (currentIndex + 1) % this.tabs.length;
					shouldActivate = this.activation === 'automatic';
				}
				break;
			case 'ArrowLeft':
				if (this.orientation === 'horizontal') {
					event.preventDefault();
					newIndex = currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
					shouldActivate = this.activation === 'automatic';
				}
				break;
			case 'ArrowDown':
				if (this.orientation === 'vertical') {
					event.preventDefault();
					newIndex = (currentIndex + 1) % this.tabs.length;
					shouldActivate = this.activation === 'automatic';
				}
				break;
			case 'ArrowUp':
				if (this.orientation === 'vertical') {
					event.preventDefault();
					newIndex = currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
					shouldActivate = this.activation === 'automatic' && this.orientation === 'vertical';
				}
				break;
			case 'Home':
				event.preventDefault();
				newIndex = 0;
				shouldActivate = this.activation === 'automatic';
				break;
			case 'End':
				event.preventDefault();
				newIndex = this.tabs.length - 1;
				shouldActivate = this.activation === 'automatic';
				break;
			case 'Enter':
			case ' ':
				if (this.activation === 'manual') {
					event.preventDefault();
					this.setActiveTab(currentIndex);
				}
				return;
			case 'Escape':
				event.preventDefault();
				event.currentTarget.blur();
				return;
			default:
				return;
		}

		this.tabs[newIndex].focus();
		if (shouldActivate) {
			this.setActiveTab(newIndex);
		}
	}

	setActiveTab(index) {
		if (index < 0 || index >= this.tabs.length) return;

		this.tabs.forEach((tab, i) => {
			const isActive = i === index;
			tab.setAttribute('aria-selected', isActive.toString());
			tab.setAttribute('tabindex', isActive ? '0' : '-1');

			if (isActive) {
				tab.setAttribute('data-active', '');
			} else {
				tab.removeAttribute('data-active');
			}
		});

		this.panels.forEach((panel, i) => {
			const isActive = i === index;
			if (isActive) {
				panel.removeAttribute('hidden');
				panel.setAttribute('data-active', '');
			} else {
				panel.setAttribute('hidden', '');
				panel.removeAttribute('data-active');
			}
		});

		this.activeTabIndex = index;

		this.dispatchEvent(
			new CustomEvent('tab-change', {
				detail: { activeIndex: index, activeTab: this.tabs[index], activePanel: this.panels[index] },
			})
		);
	}
}

customElements.define('hui-tabs', HuiTabs);
