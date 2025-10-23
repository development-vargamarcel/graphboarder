import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Modal from './Modal.svelte';

describe('Modal Component', () => {
	describe('Basic Rendering', () => {
		it('should render without errors', () => {
			const { component } = render(Modal);
			expect(component).toBeTruthy();
		});

		it('should accept modalIdetifier prop', () => {
			const { component } = render(Modal, {
				props: { modalIdetifier: 'custom-modal' }
			});
			expect(component).toBeTruthy();
		});

		it('should accept showApplyBtn prop as true', () => {
			const { component } = render(Modal, {
				props: { showApplyBtn: true }
			});
			expect(component).toBeTruthy();
		});

		it('should accept showApplyBtn prop as false', () => {
			const { component } = render(Modal, {
				props: { showApplyBtn: false }
			});
			expect(component).toBeTruthy();
		});
	});

	describe('Event Handling', () => {
		it('should accept mounted event listener', () => {
			const mounted = vi.fn();
			const { component } = render(Modal, {
				props: { modalIdetifier: 'test-modal' }
			});

			component.$on('mounted', mounted);
			expect(component).toBeTruthy();
		});

		it('should accept apply event listener', () => {
			const apply = vi.fn();
			const { component } = render(Modal);

			component.$on('apply', apply);
			expect(component).toBeTruthy();
		});

		it('should accept cancel event listener', () => {
			const cancel = vi.fn();
			const { component } = render(Modal, {
				props: { modalIdetifier: 'test-modal' }
			});

			component.$on('cancel', cancel);
			expect(component).toBeTruthy();
		});
	});

	describe('Props Configuration', () => {
		it('should handle different modalIdentifier values', () => {
			const identifiers = ['modal-1', 'user-settings', 'confirmation-dialog'];

			identifiers.forEach(identifier => {
				const { component } = render(Modal, {
					props: { modalIdetifier: identifier }
				});
				expect(component).toBeTruthy();
			});
		});

		it('should handle prop updates', async () => {
			const { component } = render(Modal, {
				props: { showApplyBtn: true }
			});

			await component.$set({ showApplyBtn: false });
			expect(component).toBeTruthy();
		});
	});

	describe('Component Lifecycle', () => {
		it('should mount successfully', () => {
			const { component } = render(Modal);
			expect(component).toBeTruthy();
		});

		it('should unmount without errors', () => {
			const { unmount } = render(Modal);
			expect(() => unmount()).not.toThrow();
		});
	});

	describe('Multiple Instances', () => {
		it('should support multiple modal instances', () => {
			const modal1 = render(Modal, {
				props: { modalIdetifier: 'modal-1' }
			});

			const modal2 = render(Modal, {
				props: { modalIdetifier: 'modal-2' }
			});

			expect(modal1.component).toBeTruthy();
			expect(modal2.component).toBeTruthy();
		});
	});
});
