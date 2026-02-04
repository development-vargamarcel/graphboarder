import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommandPalette from './CommandPalette.svelte';
import { commandPaletteStore } from '$lib/stores/commandPalette';

describe('CommandPalette Component', () => {
	beforeEach(() => {
		commandPaletteStore.close();
		commandPaletteStore.setSearchQuery('');
		// Clear commands
		// Note: we can't easily clear the commands store if we don't expose a clear method,
		// but we can unregister known ones if needed.
	});

	it('should not be visible by default', () => {
		render(CommandPalette);
		const input = screen.queryByPlaceholderText('Type a command or search...');
		expect(input).not.toBeInTheDocument();
	});

	it('should be visible when store is open', async () => {
		render(CommandPalette);
		commandPaletteStore.open();

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
		});
	});

	it('should list commands', async () => {
		const action = vi.fn();
		commandPaletteStore.registerCommand({
			id: 'test',
			title: 'Test Command',
			action
		});

		render(CommandPalette);
		commandPaletteStore.open();

		await waitFor(() => {
			expect(screen.getByText('Test Command')).toBeInTheDocument();
		});
	});

	it('should filter commands', async () => {
		commandPaletteStore.registerCommand({
			id: 'cmd1',
			title: 'Apple',
			action: () => {}
		});
		commandPaletteStore.registerCommand({
			id: 'cmd2',
			title: 'Banana',
			action: () => {}
		});

		render(CommandPalette);
		commandPaletteStore.open();

		await waitFor(() => {
			expect(screen.getByText('Apple')).toBeInTheDocument();
			expect(screen.getByText('Banana')).toBeInTheDocument();
		});

		const input = screen.getByPlaceholderText('Type a command or search...');
		await fireEvent.input(input, { target: { value: 'App' } });

		await waitFor(() => {
			expect(screen.getByText('Apple')).toBeInTheDocument();
			expect(screen.queryByText('Banana')).not.toBeInTheDocument();
		});
	});
});
