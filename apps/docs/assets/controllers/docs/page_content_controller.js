import { Controller } from '@hotwired/stimulus';
import { getId } from '../../utils/id';

export default class extends Controller {
	static targets = [
		'nav',
		'content',
		'noHeadingsTemplate',
		'tocContainerTemplate',
		'h2LinkTemplate',
		'h3LinkTemplate',
		'h3ContainerTemplate',
	];

	connect() {
		this.generateTableOfContents();
		this.setupScrollObserver();
	}

	disconnect() {
		if (this.observer) {
			this.observer.disconnect();
		}
	}

	generateTableOfContents() {
		const headings = this.contentTarget.querySelectorAll('h2, h3');

		if (headings.length === 0) {
			const template = this.createElementFromTemplate('noHeadingsTemplate');
			if (template) {
				this.navTarget.innerHTML = template.outerHTML;
			}
			return;
		}

		const tocContainer = this.createElementFromTemplate('tocContainerTemplate');
		if (!tocContainer) return;
		const ul = tocContainer.querySelector('ul');

		let currentH2Li = null;
		let h3Container = null;

		headings.forEach((heading, _index) => {
			const id = heading.id || getId();

			if (!heading.id) {
				heading.id = id;
			}

			const text = heading.textContent.trim();
			const level = heading.tagName.toLowerCase();

			if (level === 'h2') {
				const h2Li = this.createElementFromTemplate('h2LinkTemplate');
				if (!h2Li) return;
				const link = h2Li.querySelector('a');
				link.href = `#${id}`;
				link.setAttribute('data-heading-id', id);
				link.textContent = text;

				ul.appendChild(h2Li);
				currentH2Li = h2Li;
				h3Container = null;
			} else if (level === 'h3' && currentH2Li) {
				if (!h3Container) {
					h3Container = this.createElementFromTemplate('h3ContainerTemplate');
					if (!h3Container) return;
					currentH2Li.appendChild(h3Container);
				}

				const h3Li = this.createElementFromTemplate('h3LinkTemplate');
				if (!h3Li) return;
				const link = h3Li.querySelector('a');
				link.href = `#${id}`;
				link.setAttribute('data-heading-id', id);
				link.textContent = text;

				if (h3Container.tagName === 'UL') {
					h3Container.appendChild(h3Li);
				} else {
					const h3Ul = h3Container.querySelector('ul');
					if (h3Ul) {
						h3Ul.appendChild(h3Li);
					}
				}
			}
		});

		this.navTarget.innerHTML = tocContainer.outerHTML;
		this.tocLinks = this.navTarget.querySelectorAll('.toc-link');
		this.headings = headings;
		this.addSmoothScrollListeners();
	}

	createElementFromTemplate(templateName) {
		const template = this[`${templateName}Target`];
		if (!template) {
			console.error(`Template target "${templateName}" not found`);
			return null;
		}
		return template.content.firstElementChild.cloneNode(true);
	}

	addSmoothScrollListeners() {
		if (!this.tocLinks) return;

		this.tocLinks.forEach((link) => {
			link.addEventListener('click', (e) => {
				e.preventDefault();

				const headingId = link.getAttribute('data-heading-id');
				const targetElement = document.getElementById(headingId);

				if (targetElement) {
					const targetTop = targetElement.offsetTop;

					window.scrollTo({
						top: Math.max(0, targetTop),
						behavior: 'instant',
					});

					history.replaceState(null, null, `#${headingId}`);
				}
			});
		});
	}

	setupScrollObserver() {
		if (!this.headings || this.headings.length === 0) return;

		this.observer = new IntersectionObserver(
			(entries) => {
				const visibleHeadings = entries.filter((entry) => entry.isIntersecting);

				if (visibleHeadings.length > 0) {
					this.clearActiveStates();

					// Find the heading closest to the top of the viewport
					const closestHeading = visibleHeadings.reduce((closest, current) => {
						const currentTop = current.boundingClientRect.top;
						const closestTop = closest.boundingClientRect.top;

						// Prefer the heading closest to the top that's still visible
						return Math.abs(currentTop) < Math.abs(closestTop) ? current : closest;
					});

					const headingId = closestHeading.target.id;
					const tocLink = this.navTarget.querySelector(`a[data-heading-id="${headingId}"]`);
					if (tocLink) {
						tocLink.setAttribute('data-active', 'true');
					}
				}
			},
			{
				threshold: 0.1,
				rootMargin: '-10% 0px -70% 0px',
			}
		);

		this.headings.forEach((heading) => {
			this.observer.observe(heading);
		});
	}

	clearActiveStates() {
		if (!this.tocLinks) return;

		this.tocLinks.forEach((link) => {
			link.removeAttribute('data-active');
		});
	}
}
