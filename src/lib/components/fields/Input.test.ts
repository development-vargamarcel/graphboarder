import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import Input from './Input.svelte';

// Create a wrapper component that provides context
const createTestContext = (mutationVersion = false) => {
	return `
		<script>
			import { setContext } from 'svelte';
			import { writable } from 'svelte/store';
			import Input from './Input.svelte';

			setContext('mutationVersion', writable(${mutationVersion}));
			export let displayInterface;
			export let rawValue;
			export let dispatchValue;
		</script>

		<Input {displayInterface} {rawValue} {dispatchValue} on:changed />
	`;
};

describe('Input Component', () => {
	describe('Rendering', () => {
		it('should render input element', () => {
			// We need to mock the context
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: '' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input');
			expect(input).toBeTruthy();
		});

		it('should set correct input type from displayInterface', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'number', rawValue: 0 },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.type).toBe('number');
		});

		it('should handle text input type', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: 'test' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.type).toBe('text');
		});

		it('should have correct CSS classes', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: '' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input');
			expect(input?.classList.contains('input')).toBe(true);
			expect(input?.classList.contains('input-primary')).toBe(true);
		});

		it('should apply input-md class when mutationVersion is true', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: '' },
				context: new Map([['mutationVersion', writable(true)]])
			});

			const input = container.querySelector('input');
			expect(input?.classList.contains('input-md')).toBe(true);
		});

		it('should apply input-xs class when mutationVersion is false', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: '' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input');
			expect(input?.classList.contains('input-xs')).toBe(true);
		});
	});

	describe('Value Handling', () => {
		it('should display rawValue in input', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: 'initial value' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('initial value');
		});

		it('should handle numeric rawValue', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'number', rawValue: 42 },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('42');
		});

		it('should initialize rawValue from dispatchValue when rawValue is not provided', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', dispatchValue: 'from dispatch' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('from dispatch');
		});

		it('should handle empty string', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: '' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('');
		});
	});

	describe('Event Dispatching', () => {
		it('should dispatch changed event on input change', async () => {
			const changed = vi.fn();
			const { container, component } = render(Input, {
				props: { displayInterface: 'text', rawValue: 'initial' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			component.$on('changed', changed);

			const input = container.querySelector('input') as HTMLInputElement;
			input.value = 'new value';
			await fireEvent.change(input);

			expect(changed).toHaveBeenCalled();
		});

		it('should include chd_rawValue in event detail', async () => {
			const changed = vi.fn();
			const { container, component } = render(Input, {
				props: { displayInterface: 'text', rawValue: 'initial' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			component.$on('changed', changed);

			const input = container.querySelector('input') as HTMLInputElement;
			input.value = 'new value';
			await fireEvent.change(input);

			expect(changed).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: expect.objectContaining({
						chd_rawValue: 'new value'
					})
				})
			);
		});

		it('should set rawValue to undefined when number input is cleared', async () => {
			const changed = vi.fn();
			const { container, component } = render(Input, {
				props: { displayInterface: 'number', rawValue: 42 },
				context: new Map([['mutationVersion', writable(false)]])
			});

			component.$on('changed', changed);

			const input = container.querySelector('input') as HTMLInputElement;
			input.value = '';
			await fireEvent.change(input);

			expect(changed).toHaveBeenCalledWith(
				expect.objectContaining({
					detail: expect.objectContaining({
						chd_rawValue: undefined
					})
				})
			);
		});

		it('should handle multiple change events', async () => {
			const changed = vi.fn();
			const { container, component } = render(Input, {
				props: { displayInterface: 'text', rawValue: '' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			component.$on('changed', changed);

			const input = container.querySelector('input') as HTMLInputElement;

			input.value = 'first';
			await fireEvent.change(input);

			input.value = 'second';
			await fireEvent.change(input);

			input.value = 'third';
			await fireEvent.change(input);

			expect(changed).toHaveBeenCalledTimes(3);
		});
	});

	describe('Number Input Special Cases', () => {
		it('should handle zero value', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'number', rawValue: 0 },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('0');
		});

		it('should handle negative numbers', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'number', rawValue: -100 },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('-100');
		});

		it('should handle decimal numbers', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'number', rawValue: 3.14 },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('3.14');
		});
	});

	describe('Text Input Types', () => {
		it('should support email type', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'email', rawValue: 'test@example.com' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.type).toBe('email');
		});

		it('should support password type', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'password', rawValue: 'secret' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.type).toBe('password');
		});

		it('should support date type', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'date', rawValue: '2023-01-01' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.type).toBe('date');
		});
	});

	describe('Edge Cases', () => {
		it('should handle undefined rawValue', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: undefined },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input).toBeTruthy();
		});

		it('should handle null rawValue', () => {
			const { container } = render(Input, {
				props: { displayInterface: 'text', rawValue: null },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input).toBeTruthy();
		});

		it('should update when rawValue prop changes', async () => {
			const { container, component } = render(Input, {
				props: { displayInterface: 'text', rawValue: 'initial' },
				context: new Map([['mutationVersion', writable(false)]])
			});

			const input = container.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('initial');

			await component.$set({ rawValue: 'updated' });
			expect(input.value).toBe('updated');
		});
	});
});
