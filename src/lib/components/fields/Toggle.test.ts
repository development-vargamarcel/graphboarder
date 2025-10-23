import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Toggle from './Toggle.svelte';

describe('Toggle Component', () => {
	describe('Rendering - Standard Toggle Mode', () => {
		it('should render toggle checkbox by default', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', useSwap: false }
			});

			const checkbox = container.querySelector('input[type="checkbox"]');
			expect(checkbox).toBeTruthy();
			expect(checkbox?.classList.contains('toggle')).toBe(true);
		});

		it('should have toggle-primary class', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', useSwap: false }
			});

			const checkbox = container.querySelector('input[type="checkbox"]');
			expect(checkbox?.classList.contains('toggle-primary')).toBe(true);
		});

		it('should render label wrapper', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', useSwap: false }
			});

			const label = container.querySelector('label');
			expect(label).toBeTruthy();
		});

		it('should show value text by default', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: true, showValue: true }
			});

			const valueText = container.querySelector('p.text-primary');
			expect(valueText).toBeTruthy();
			expect(valueText?.textContent).toBe('true');
		});

		it('should hide value text when showValue is false', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: true, showValue: false }
			});

			const valueText = container.querySelector('p');
			// Should not have the text showing the value
			expect(valueText?.textContent).not.toBe('true');
		});

		it('should apply custom classes from otherClases prop', () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					otherClases: 'custom-class another-class'
				}
			});

			const checkbox = container.querySelector('input[type="checkbox"]');
			expect(checkbox?.classList.contains('custom-class')).toBe(true);
			expect(checkbox?.classList.contains('another-class')).toBe(true);
		});
	});

	describe('Rendering - Swap Mode', () => {
		it('should render swap component when useSwap is true', () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					useSwap: true,
					swapOnText: 'On',
					swapOffText: 'Off'
				}
			});

			const swapLabel = container.querySelector('label.swap');
			expect(swapLabel).toBeTruthy();
		});

		it('should show swap-on and swap-off text', () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					useSwap: true,
					swapOnText: 'Enabled',
					swapOffText: 'Disabled'
				}
			});

			const swapOn = container.querySelector('.swap-on');
			const swapOff = container.querySelector('.swap-off');

			expect(swapOn?.textContent).toBe('Enabled');
			expect(swapOff?.textContent).toBe('Disabled');
		});

		it('should use swapOnText for swapOffText when swapOffText is not provided', () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					useSwap: true,
					swapOnText: 'Toggle'
				}
			});

			const swapOn = container.querySelector('.swap-on');
			const swapOff = container.querySelector('.swap-off');

			expect(swapOn?.textContent).toBe('Toggle');
			expect(swapOff?.textContent).toBe('Toggle');
		});

		it('should apply line-through when swapOfftextLinethrough is true', () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					useSwap: true,
					swapOnText: 'Same',
					swapOffText: 'Same'
				}
			});

			const swapOff = container.querySelector('.swap-off');
			expect(swapOff?.classList.contains('line-through')).toBe(true);
		});

		it('should not apply line-through when texts are different', () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					useSwap: true,
					swapOnText: 'On',
					swapOffText: 'Off'
				}
			});

			const swapOff = container.querySelector('.swap-off');
			expect(swapOff?.classList.contains('line-through')).toBe(false);
		});
	});

	describe('Value Handling', () => {
		it('should be checked when rawValue is true', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: true }
			});

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			expect(checkbox.checked).toBe(true);
		});

		it('should be unchecked when rawValue is false', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: false }
			});

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			expect(checkbox.checked).toBe(false);
		});

		it('should default to true when rawValue is not provided', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox' }
			});

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			expect(checkbox.checked).toBe(true);
		});

		it('should display value text in primary color when true', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: true, showValue: true }
			});

			const valueText = container.querySelector('p.text-primary');
			expect(valueText).toBeTruthy();
			expect(valueText?.textContent).toBe('true');
		});

		it('should display value text without primary color when false', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: false, showValue: true }
			});

			const paragraphs = Array.from(container.querySelectorAll('p'));
			const valueText = paragraphs.find(p => p.textContent === 'false');
			expect(valueText).toBeTruthy();
			expect(valueText?.classList.contains('text-primary')).toBe(false);
		});
	});

	describe('Event Dispatching - Standard Toggle', () => {
		it('should dispatch changed event on toggle', async () => {
			const changed = vi.fn();
			const { container, component } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: false }
			});

			component.$on('changed', changed);

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			await fireEvent.click(checkbox);

			expect(changed).toHaveBeenCalled();
		});

		it('should dispatch changed event with chd_rawValue true when toggled on', async () => {
			const changed = vi.fn();
			const { container, component } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: false }
			});

			component.$on('changed', changed);

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			await fireEvent.click(checkbox);

			expect(changed).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: expect.objectContaining({
						chd_rawValue: true
					})
				})
			);
		});

		it('should dispatch changed event with chd_rawValue false when toggled off', async () => {
			const changed = vi.fn();
			const { container, component } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: true }
			});

			component.$on('changed', changed);

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			await fireEvent.click(checkbox);

			expect(changed).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: expect.objectContaining({
						chd_rawValue: false
					})
				})
			);
		});

		it('should handle multiple toggles', async () => {
			const changed = vi.fn();
			const { container, component } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: false }
			});

			component.$on('changed', changed);

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

			await fireEvent.click(checkbox);
			await fireEvent.click(checkbox);
			await fireEvent.click(checkbox);

			expect(changed).toHaveBeenCalledTimes(3);
		});
	});

	describe('Event Dispatching - Swap Mode', () => {
		it('should dispatch changed event in swap mode', async () => {
			const changed = vi.fn();
			const { container, component } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					rawValue: false,
					useSwap: true,
					swapOnText: 'On',
					swapOffText: 'Off'
				}
			});

			component.$on('changed', changed);

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			await fireEvent.click(checkbox);

			expect(changed).toHaveBeenCalled();
		});

		it('should update swap display when toggled', async () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					rawValue: false,
					useSwap: true,
					swapOnText: 'Active',
					swapOffText: 'Inactive'
				}
			});

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			await fireEvent.click(checkbox);

			expect(checkbox.checked).toBe(true);
		});
	});

	describe('Reactive Updates', () => {
		it('should update checked state when rawValue prop changes', async () => {
			const { container, component } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: false }
			});

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
			expect(checkbox.checked).toBe(false);

			await component.$set({ rawValue: true });
			expect(checkbox.checked).toBe(true);
		});

		it('should update value text when rawValue changes', async () => {
			const { container, component } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: true, showValue: true }
			});

			let valueText = container.querySelector('p.text-primary');
			expect(valueText?.textContent).toBe('true');

			await component.$set({ rawValue: false });

			const paragraphs = Array.from(container.querySelectorAll('p'));
			valueText = paragraphs.find(p => p.textContent === 'false') || null;
			expect(valueText?.textContent).toBe('false');
		});
	});

	describe('Custom Classes', () => {
		it('should apply otherClases in standard mode', () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					otherClases: 'toggle-lg toggle-secondary'
				}
			});

			const checkbox = container.querySelector('input[type="checkbox"]');
			expect(checkbox?.classList.contains('toggle-lg')).toBe(true);
			expect(checkbox?.classList.contains('toggle-secondary')).toBe(true);
		});

		it('should apply otherClases in swap mode', () => {
			const { container } = render(Toggle, {
				props: {
					displayInterface: 'checkbox',
					useSwap: true,
					swapOnText: 'On',
					otherClases: 'custom-swap'
				}
			});

			const checkbox = container.querySelector('input[type="checkbox"]');
			expect(checkbox?.classList.contains('custom-swap')).toBe(true);
		});
	});

	describe('Edge Cases', () => {
		it('should handle rapid successive toggles', async () => {
			const changed = vi.fn();
			const { container, component } = render(Toggle, {
				props: { displayInterface: 'checkbox', rawValue: false }
			});

			component.$on('changed', changed);

			const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

			// Rapidly toggle
			for (let i = 0; i < 10; i++) {
				await fireEvent.click(checkbox);
			}

			expect(changed).toHaveBeenCalledTimes(10);
		});

		it('should work with empty otherClases', () => {
			const { container } = render(Toggle, {
				props: { displayInterface: 'checkbox', otherClases: '' }
			});

			const checkbox = container.querySelector('input[type="checkbox"]');
			expect(checkbox).toBeTruthy();
		});
	});
});
