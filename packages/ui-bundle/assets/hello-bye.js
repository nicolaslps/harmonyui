import { css, html, LitElement } from 'lit';

export class HelloBye extends LitElement {
	static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 20px;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  `;

	static properties = {
		isHello: { type: Boolean },
	};

	constructor() {
		super();
		this.isHello = true;
	}

	connectedCallback() {
		super.connectedCallback();
		this.startAlternating();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	startAlternating() {
		this.intervalId = setInterval(() => {
			this.isHello = !this.isHello;
		}, 2000);
	}

	render() {
		return html`
      <div>
        ${this.isHello ? 'Bonjour' : 'Au revoir'}
      </div>
    `;
	}
}

customElements.define('hello-bye', HelloBye);
