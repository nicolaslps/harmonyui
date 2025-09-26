class ScreenLock {
	constructor() {
		this.scrollPosition = 0;
		this.isLocked = false;
		this.lockCount = 0;
		this.originalOverflow = '';
		this.originalPosition = '';
		this.originalTop = '';
		this.originalWidth = '';
	}

	lock() {
		this.lockCount++;

		if (this.isLocked) {
			return;
		}

		this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

		const body = document.body;
		this.originalOverflow = body.style.overflow;
		this.originalPosition = body.style.position;
		this.originalTop = body.style.top;
		this.originalWidth = body.style.width;

		body.style.overflow = 'hidden';
		body.style.position = 'fixed';
		body.style.top = `-${this.scrollPosition}px`;
		body.style.width = '100%';

		this.isLocked = true;
	}

	unlock() {
		this.lockCount = Math.max(0, this.lockCount - 1);

		if (this.lockCount > 0) {
			return;
		}

		if (!this.isLocked) {
			return;
		}

		const body = document.body;

		body.style.overflow = this.originalOverflow;
		body.style.position = this.originalPosition;
		body.style.top = this.originalTop;
		body.style.width = this.originalWidth;

		window.scrollTo(0, this.scrollPosition);

		this.isLocked = false;
	}

	forceUnlock() {
		this.lockCount = 0;
		this.unlock();
	}

	get locked() {
		return this.isLocked;
	}

	get count() {
		return this.lockCount;
	}
}

const screenLock = new ScreenLock();

export { screenLock, ScreenLock };
