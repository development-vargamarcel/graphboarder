import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { clickOutside } from './clickOutside';

describe('clickOutside action', () => {
	let element: HTMLElement;
	let outsideElement: HTMLElement;
	let eventListener: (event: CustomEvent) => void;

	beforeEach(() => {
		// Create test elements
		element = document.createElement('div');
		element.setAttribute('data-testid', 'target-element');
		document.body.appendChild(element);

		outsideElement = document.createElement('div');
		outsideElement.setAttribute('data-testid', 'outside-element');
		document.body.appendChild(outsideElement);

		// Create event listener spy
		eventListener = vi.fn();
	});

	afterEach(() => {
		// Cleanup
		document.body.removeChild(element);
		document.body.removeChild(outsideElement);
		element.removeEventListener('click_outside', eventListener);
	});

	describe('Event Detection', () => {
		it('should dispatch click_outside event when clicking outside element', () => {
			const action = clickOutside(element);
			element.addEventListener('click_outside', eventListener);

			// Click outside the element
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			outsideElement.dispatchEvent(event);

			expect(eventListener).toHaveBeenCalledTimes(1);
			action.destroy();
		});

		it('should not dispatch event when clicking inside element', () => {
			const action = clickOutside(element);
			element.addEventListener('click_outside', eventListener);

			// Click inside the element
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			element.dispatchEvent(event);

			expect(eventListener).not.toHaveBeenCalled();
			action.destroy();
		});

		it('should not dispatch event when clicking on child of element', () => {
			const child = document.createElement('span');
			child.setAttribute('data-testid', 'child-element');
			element.appendChild(child);

			const action = clickOutside(element);
			element.addEventListener('click_outside', eventListener);

			// Click on child element
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			child.dispatchEvent(event);

			expect(eventListener).not.toHaveBeenCalled();

			element.removeChild(child);
			action.destroy();
		});

		it('should not dispatch event when click has defaultPrevented', () => {
			const action = clickOutside(element);
			element.addEventListener('click_outside', eventListener);

			// Create a prevented event
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			event.preventDefault();
			outsideElement.dispatchEvent(event);

			expect(eventListener).not.toHaveBeenCalled();
			action.destroy();
		});
	});

	describe('Lifecycle', () => {
		it('should return an object with destroy method', () => {
			const action = clickOutside(element);

			expect(action).toHaveProperty('destroy');
			expect(typeof action.destroy).toBe('function');

			action.destroy();
		});

		it('should stop listening after destroy is called', () => {
			const action = clickOutside(element);
			element.addEventListener('click_outside', eventListener);

			// Destroy the action
			action.destroy();

			// Try to trigger event after destroy
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			outsideElement.dispatchEvent(event);

			expect(eventListener).not.toHaveBeenCalled();
		});

		it('should allow multiple instances on different elements', () => {
			const element2 = document.createElement('div');
			document.body.appendChild(element2);

			const listener1 = vi.fn();
			const listener2 = vi.fn();

			const action1 = clickOutside(element);
			const action2 = clickOutside(element2);

			element.addEventListener('click_outside', listener1);
			element2.addEventListener('click_outside', listener2);

			// Click outside both elements
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			outsideElement.dispatchEvent(event);

			expect(listener1).toHaveBeenCalledTimes(1);
			expect(listener2).toHaveBeenCalledTimes(1);

			action1.destroy();
			action2.destroy();
			document.body.removeChild(element2);
		});
	});

	describe('Edge Cases', () => {
		it('should handle rapid successive clicks', () => {
			const action = clickOutside(element);
			element.addEventListener('click_outside', eventListener);

			// Multiple rapid clicks outside
			for (let i = 0; i < 5; i++) {
				const event = new MouseEvent('click', {
					bubbles: true,
					cancelable: true
				});
				outsideElement.dispatchEvent(event);
			}

			expect(eventListener).toHaveBeenCalledTimes(5);
			action.destroy();
		});

		it('should handle clicks on document body', () => {
			const action = clickOutside(element);
			element.addEventListener('click_outside', eventListener);

			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			document.body.dispatchEvent(event);

			expect(eventListener).toHaveBeenCalledTimes(1);
			action.destroy();
		});

		it('should work with nested elements', () => {
			const parent = document.createElement('div');
			const child = document.createElement('div');
			const grandchild = document.createElement('div');

			parent.appendChild(child);
			child.appendChild(grandchild);
			document.body.appendChild(parent);

			const action = clickOutside(child);
			child.addEventListener('click_outside', eventListener);

			// Click on grandchild (should not trigger)
			let event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			grandchild.dispatchEvent(event);
			expect(eventListener).not.toHaveBeenCalled();

			// Click on parent (should trigger)
			event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});
			parent.dispatchEvent(event);
			expect(eventListener).toHaveBeenCalledTimes(1);

			action.destroy();
			document.body.removeChild(parent);
		});

		it('should handle null or undefined event targets gracefully', () => {
			const action = clickOutside(element);
			element.addEventListener('click_outside', eventListener);

			// Create event with no specific target
			const event = new MouseEvent('click', {
				bubbles: true,
				cancelable: true
			});

			// Dispatch on document
			document.dispatchEvent(event);

			// Should handle gracefully without errors
			expect(() => {
				document.dispatchEvent(event);
			}).not.toThrow();

			action.destroy();
		});
	});

	describe('Event Properties', () => {
		it('should dispatch CustomEvent with correct type', () => {
			return new Promise<void>((resolve) => {
				const action = clickOutside(element);

				element.addEventListener('click_outside', ((event: CustomEvent) => {
					expect(event).toBeInstanceOf(CustomEvent);
					expect(event.type).toBe('click_outside');
					action.destroy();
					resolve();
				}) as EventListener);

				const clickEvent = new MouseEvent('click', {
					bubbles: true,
					cancelable: true
				});
				outsideElement.dispatchEvent(clickEvent);
			});
		});
	});
});
