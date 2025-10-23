import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectSwipe } from './detectSwipe';

// Helper function to create touch events
function createTouchEvent(
	type: 'touchstart' | 'touchmove' | 'touchend',
	clientX: number,
	clientY: number,
	timeStamp: number = Date.now()
): TouchEvent {
	const touch = {
		clientX,
		clientY,
		identifier: 0,
		pageX: clientX,
		pageY: clientY,
		screenX: clientX,
		screenY: clientY,
		target: document.createElement('div'),
		radiusX: 0,
		radiusY: 0,
		rotationAngle: 0,
		force: 1
	} as Touch;

	const touchEvent = new TouchEvent(type, {
		touches: type !== 'touchend' ? [touch] : [],
		targetTouches: [],
		changedTouches: [touch],
		bubbles: true,
		cancelable: true
	});

	// Mock timeStamp
	Object.defineProperty(touchEvent, 'timeStamp', {
		value: timeStamp,
		writable: false
	});

	return touchEvent;
}

describe('detectSwipe action', () => {
	let element: HTMLElement;

	beforeEach(() => {
		element = document.createElement('div');
		element.setAttribute('data-testid', 'swipe-target');
		document.body.appendChild(element);
	});

	afterEach(() => {
		document.body.removeChild(element);
	});

	describe('Swipe Detection - Horizontal', () => {
		it('should detect swipe left gesture', () => {
			return new Promise<void>((resolve) => {
				const action = detectSwipe(element);

				element.addEventListener('swipeleft', () => {
					expect(true).toBe(true);
					action.destroy();
					resolve();
				});

				// Simulate swipe left (move from left to right, positive diffX)
				const startTime = 1000;
				const touchStart = createTouchEvent('touchstart', 100, 100, startTime);
				const touchMove = createTouchEvent('touchmove', 50, 100, startTime + 50);
				const touchEnd = createTouchEvent('touchend', 50, 100, startTime + 100);

				document.dispatchEvent(touchStart);
				document.dispatchEvent(touchMove);
				document.dispatchEvent(touchEnd);
			});
		});

		it('should detect swipe right gesture', () => {
			return new Promise<void>((resolve) => {
				const action = detectSwipe(element);

				element.addEventListener('swiperight', () => {
					expect(true).toBe(true);
					action.destroy();
					resolve();
				});

				// Simulate swipe right (move from right to left, negative diffX)
				const startTime = 1000;
				const touchStart = createTouchEvent('touchstart', 50, 100, startTime);
				const touchMove = createTouchEvent('touchmove', 100, 100, startTime + 50);
				const touchEnd = createTouchEvent('touchend', 100, 100, startTime + 100);

				document.dispatchEvent(touchStart);
				document.dispatchEvent(touchMove);
				document.dispatchEvent(touchEnd);
			});
		});
	});

	describe('Swipe Detection - Vertical', () => {
		it('should detect swipe up gesture', () => {
			return new Promise<void>((resolve) => {
				const action = detectSwipe(element);

				element.addEventListener('swipeup', () => {
					expect(true).toBe(true);
					action.destroy();
					resolve();
				});

				// Simulate swipe up (move from top to bottom, positive diffY)
				const startTime = 1000;
				const touchStart = createTouchEvent('touchstart', 100, 100, startTime);
				const touchMove = createTouchEvent('touchmove', 100, 50, startTime + 50);
				const touchEnd = createTouchEvent('touchend', 100, 50, startTime + 100);

				document.dispatchEvent(touchStart);
				document.dispatchEvent(touchMove);
				document.dispatchEvent(touchEnd);
			});
		});

		it('should detect swipe down gesture', () => {
			return new Promise<void>((resolve) => {
				const action = detectSwipe(element);

				element.addEventListener('swipedown', () => {
					expect(true).toBe(true);
					action.destroy();
					resolve();
				});

				// Simulate swipe down (move from bottom to top, negative diffY)
				const startTime = 1000;
				const touchStart = createTouchEvent('touchstart', 100, 50, startTime);
				const touchMove = createTouchEvent('touchmove', 100, 100, startTime + 50);
				const touchEnd = createTouchEvent('touchend', 100, 100, startTime + 100);

				document.dispatchEvent(touchStart);
				document.dispatchEvent(touchMove);
				document.dispatchEvent(touchEnd);
			});
		});
	});

	describe('Speed Threshold', () => {
		it('should not trigger swipe if speed is too slow', async () => {
			const action = detectSwipe(element);

			const swipeHandler = vi.fn();
			element.addEventListener('swipeleft', swipeHandler);
			element.addEventListener('swiperight', swipeHandler);
			element.addEventListener('swipeup', swipeHandler);
			element.addEventListener('swipedown', swipeHandler);

			// Very slow swipe (minSpeed is 0.1, this should be slower)
			const startTime = 1000;
			const touchStart = createTouchEvent('touchstart', 100, 100, startTime);
			const touchMove = createTouchEvent('touchmove', 102, 100, startTime + 50);
			const touchEnd = createTouchEvent('touchend', 102, 100, startTime + 1000); // Very long duration

			document.dispatchEvent(touchStart);
			document.dispatchEvent(touchMove);
			document.dispatchEvent(touchEnd);

			// Wait a bit to ensure no event was fired
			await new Promise(resolve => setTimeout(resolve, 100));
			expect(swipeHandler).not.toHaveBeenCalled();
			action.destroy();
		});

		it('should trigger swipe if speed is above threshold', () => {
			return new Promise<void>((resolve) => {
				const action = detectSwipe(element);

				element.addEventListener('swipeleft', () => {
					expect(true).toBe(true);
					action.destroy();
					resolve();
				});

				// Fast swipe (speed > 0.1)
				const startTime = 1000;
				const touchStart = createTouchEvent('touchstart', 100, 100, startTime);
				const touchMove = createTouchEvent('touchmove', 50, 100, startTime + 10);
				const touchEnd = createTouchEvent('touchend', 50, 100, startTime + 50);

				document.dispatchEvent(touchStart);
				document.dispatchEvent(touchMove);
				document.dispatchEvent(touchEnd);
			});
		});
	});

	describe('Lifecycle', () => {
		it('should return an object with destroy method', () => {
			const action = detectSwipe(element);

			expect(action).toHaveProperty('destroy');
			expect(typeof action.destroy).toBe('function');

			action.destroy();
		});

		it('should stop detecting swipes after destroy is called', async () => {
			const action = detectSwipe(element);

			const swipeHandler = vi.fn();
			element.addEventListener('swipeleft', swipeHandler);

			// Destroy before swiping
			action.destroy();

			// Try to swipe after destroy
			const startTime = 1000;
			const touchStart = createTouchEvent('touchstart', 100, 100, startTime);
			const touchMove = createTouchEvent('touchmove', 50, 100, startTime + 10);
			const touchEnd = createTouchEvent('touchend', 50, 100, startTime + 50);

			document.dispatchEvent(touchStart);
			document.dispatchEvent(touchMove);
			document.dispatchEvent(touchEnd);

			await new Promise(resolve => setTimeout(resolve, 100));
			expect(swipeHandler).not.toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle touchend without touchmove', async () => {
			const action = detectSwipe(element);

			const swipeHandler = vi.fn();
			element.addEventListener('swipeleft', swipeHandler);

			const startTime = 1000;
			const touchStart = createTouchEvent('touchstart', 100, 100, startTime);
			const touchEnd = createTouchEvent('touchend', 100, 100, startTime + 50);

			document.dispatchEvent(touchStart);
			// Skip touchmove
			document.dispatchEvent(touchEnd);

			await new Promise(resolve => setTimeout(resolve, 100));
			expect(swipeHandler).not.toHaveBeenCalled();
			action.destroy();
		});

		it('should handle touchmove without touchstart', async () => {
			const action = detectSwipe(element);

			const swipeHandler = vi.fn();
			element.addEventListener('swipeleft', swipeHandler);

			const startTime = 1000;
			// Skip touchstart
			const touchMove = createTouchEvent('touchmove', 50, 100, startTime + 10);
			const touchEnd = createTouchEvent('touchend', 50, 100, startTime + 50);

			document.dispatchEvent(touchMove);
			document.dispatchEvent(touchEnd);

			await new Promise(resolve => setTimeout(resolve, 100));
			expect(swipeHandler).not.toHaveBeenCalled();
			action.destroy();
		});
	});

	describe('Event Properties', () => {
		it('should dispatch CustomEvent with correct properties', () => {
			return new Promise<void>((resolve) => {
				const action = detectSwipe(element);

				element.addEventListener('swipeleft', ((event: CustomEvent) => {
					expect(event).toBeInstanceOf(CustomEvent);
					expect(event.type).toBe('swipeleft');
					expect(event.bubbles).toBe(false);
					action.destroy();
					resolve();
				}) as EventListener);

				const startTime = 1000;
				document.dispatchEvent(createTouchEvent('touchstart', 100, 100, startTime));
				document.dispatchEvent(createTouchEvent('touchmove', 50, 100, startTime + 10));
				document.dispatchEvent(createTouchEvent('touchend', 50, 100, startTime + 50));
			});
		});
	});
});
