import { writable, derived } from 'svelte/store';
import { Logger } from '$lib/utils/logger';

export interface Command {
	id: string;
	title: string;
	category?: string;
	description?: string;
	icon?: string;
	action: () => void;
	shortcut?: string;
}

function createCommandPaletteStore() {
	const { subscribe, set, update } = writable({
		isOpen: false,
		searchQuery: ''
	});

	const commands = writable<Command[]>([]);

	return {
		subscribe,
		set,
		update,
		toggle: () => {
			update((state) => {
				const newState = !state.isOpen;
				Logger.debug(`Command Palette toggled: ${newState}`);
				return { ...state, isOpen: newState, searchQuery: '' };
			});
		},
		open: () => {
			update((state) => ({ ...state, isOpen: true, searchQuery: '' }));
			Logger.debug('Command Palette opened');
		},
		close: () => {
			update((state) => ({ ...state, isOpen: false }));
			Logger.debug('Command Palette closed');
		},
		setSearchQuery: (query: string) => {
			update((state) => ({ ...state, searchQuery: query }));
		},
		registerCommand: (command: Command) => {
			commands.update((cmds) => {
				if (cmds.some((c) => c.id === command.id)) {
					// Update existing
					return cmds.map((c) => (c.id === command.id ? command : c));
				}
				Logger.debug(`Command registered: ${command.id}`);
				return [...cmds, command];
			});
		},
		unregisterCommand: (id: string) => {
			commands.update((cmds) => {
				const exists = cmds.some((c) => c.id === id);
				if (exists) {
					Logger.debug(`Command unregistered: ${id}`);
				}
				return cmds.filter((c) => c.id !== id);
			});
		},
		commands: { subscribe: commands.subscribe }
	};
}

export const commandPaletteStore = createCommandPaletteStore();
