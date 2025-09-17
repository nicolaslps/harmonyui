class HuiAccordion extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.addEventListener('click', this.handleClick);
    this.setAttribute('role', 'tablist');

    const defaultValue = this.getAttribute('default-value');
    if (defaultValue) {
      setTimeout(() => {
        const defaultItem = this.querySelector(`hui-accordion-item[value="${defaultValue}"]`);
        if (defaultItem) {
          const details = defaultItem.querySelector('details');
          if (details) {
            details.open = true;
          }
        }
      }, 100);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
  }

  handleClick(event) {
    const summary = event.target.closest('summary');
    if (!summary) return;

    const details = summary.closest('details');
    if (!details) return;

    const type = this.getAttribute('type');
    if (type !== 'multiple' && type !== 'single') {
      return;
    }

    if (type === 'single') {
      this.querySelectorAll('hui-accordion-item details').forEach((detailsEl) => {
        if (detailsEl !== details) {
          detailsEl.removeAttribute('open');
        }
      });
    }
  }
}

class HuiAccordionContent extends HTMLElement {
  constructor() {
    super();
    this.handleTransition = this.handleTransition.bind(this);
  }

  connectedCallback() {
    this.updateDataAttributes();

    const details = this.closest('details');
    if (details) {
      details.addEventListener('toggle', this.handleTransition);
    }
  }

  disconnectedCallback() {
    const details = this.closest('details');
    if (details) {
      details.removeEventListener('toggle', this.handleTransition);
    }
  }

  handleTransition() {
    const details = this.closest('details');
    if (!details) return;

    if (details.open) {
      this.removeAttribute('data-closed');
      this.setAttribute('data-enter', '');
      this.setAttribute('data-transition', '');

      setTimeout(() => {
        this.removeAttribute('data-enter');
        this.removeAttribute('data-transition');
      }, 200);
    } else {
      this.setAttribute('data-leave', '');
      this.setAttribute('data-transition', '');

      setTimeout(() => {
        this.removeAttribute('data-leave');
        this.removeAttribute('data-transition');
        this.setAttribute('data-closed', '');
      }, 200);
    }
  }

  updateDataAttributes() {
    const details = this.closest('details');
    if (!details) return;

    if (details.open) {
      this.removeAttribute('data-closed');
    } else {
      this.setAttribute('data-closed', '');
    }
  }
}

customElements.define('hui-accordion', HuiAccordion);
customElements.define('hui-accordion-content', HuiAccordionContent);

export { HuiAccordion, HuiAccordionContent };