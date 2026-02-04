import { describe, it, expect, beforeEach } from 'vitest';
import { commandPaletteStore } from './commandPalette';
import { get } from 'svelte/store';

describe('Command Palette Store', () => {
	beforeEach(() => {
		commandPaletteStore.close();
		commandPaletteStore.setSearchQuery('');
		// Reset commands
		const cmds = get(commandPaletteStore.commands);
		cmds.forEach((c) => commandPaletteStore.unregisterCommand(c.id));
	});

	it('should toggle visibility', () => {
		expect(get(commandPaletteStore).isOpen).toBe(false);
		commandPaletteStore.toggle();
		expect(get(commandPaletteStore).isOpen).toBe(true);
		commandPaletteStore.toggle();
		expect(get(commandPaletteStore).isOpen).toBe(false);
	});

	it('should open and close', () => {
		commandPaletteStore.open();
		expect(get(commandPaletteStore).isOpen).toBe(true);
		commandPaletteStore.close();
		expect(get(commandPaletteStore).isOpen).toBe(false);
	});

	it('should set search query', () => {
		commandPaletteStore.setSearchQuery('test');
		expect(get(commandPaletteStore).searchQuery).toBe('test');
	});

	it('should register and unregister commands', () => {
		const cmd = {
			id: 'test-cmd',
			title: 'Test Command',
			action: () => {}
		};

		commandPaletteStore.registerCommand(cmd);
		let cmds = get(commandPaletteStore.commands);
		expect(cmds).toHaveLength(1);
		expect(cmds[0]).toEqual(cmd);

		// Register same ID should update
		const cmd2 = { ...cmd, title: 'Updated' };
		commandPaletteStore.registerCommand(cmd2);
		cmds = get(commandPaletteStore.commands);
		expect(cmds).toHaveLength(1);
		expect(cmds[0].title).toBe('Updated');

		commandPaletteStore.unregisterCommand('test-cmd');
		cmds = get(commandPaletteStore.commands);
		expect(cmds).toHaveLength(0);
	});
});
