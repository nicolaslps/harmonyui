export function getId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return `hui-${crypto.randomUUID()}`;
	}
	return `hui-${Math.random().toString(36).slice(2, 11)}`;
}
