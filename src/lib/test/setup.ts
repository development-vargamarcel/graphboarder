import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import '@testing-library/jest-dom';

if (typeof Element !== 'undefined' && !Element.prototype.animate) {
	Element.prototype.animate = () => {
		return {
			onfinish: () => {},
			cancel: () => {},
			play: () => {},
			pause: () => {},
			reverse: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			finished: Promise.resolve()
		} as any;
	};
}

// Cleanup after each test
afterEach(() => {
	cleanup();
});
