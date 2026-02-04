<script lang="ts">
	import { commandPaletteStore } from '$lib/stores/commandPalette';
	import { clickOutside } from '$lib/actions/clickOutside';
	import Fuse from 'fuse.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Logger } from '$lib/utils/logger';

	// Access the stores
	const commandsStore = commandPaletteStore.commands;

	// Derived state
	let isOpen = $derived($commandPaletteStore.isOpen);
	let commands = $derived($commandsStore);

	let searchQuery = $state('');
	let selectedIndex = $state(0);
	let searchInput = $state<HTMLInputElement>();

	// Fuse instance
	let fuse: Fuse<any> | undefined = $state();

	$effect(() => {
		if (commands) {
			fuse = new Fuse(commands, {
				keys: ['title', 'category', 'description'],
				threshold: 0.4
			});
		}
	});

	let filteredCommands = $derived.by(() => {
		if (!searchQuery || !fuse) return commands;
		return fuse.search(searchQuery).map((result) => result.item);
	});

	// Reset selection when search changes
	$effect(() => {
		searchQuery;
		selectedIndex = 0;
	});

	// Focus input when opened
	$effect(() => {
		if (isOpen && searchInput) {
			const timer = setTimeout(() => searchInput?.focus(), 50);
			return () => clearTimeout(timer);
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		// Toggle with Ctrl+K or Cmd+K
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			commandPaletteStore.toggle();
		}

		if (!isOpen) return;

		if (e.key === 'Escape') {
			commandPaletteStore.close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (filteredCommands.length > 0) {
				selectedIndex = (selectedIndex + 1) % filteredCommands.length;
				scrollSelectedIntoView();
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (filteredCommands.length > 0) {
				selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
				scrollSelectedIntoView();
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (filteredCommands.length > 0) {
				executeCommand(filteredCommands[selectedIndex]);
			}
		}
	}

	function executeCommand(command: any) {
		if (command) {
			commandPaletteStore.close();
			try {
				Logger.debug(`Executing command: ${command.title}`);
				command.action();
			} catch (e) {
				Logger.error('Error executing command', e);
			}
		}
	}

	function scrollSelectedIntoView() {
		const el = document.getElementById(`cmd-item-${selectedIndex}`);
		el?.scrollIntoView({ block: 'nearest' });
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm transition-opacity"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="w-full max-w-2xl bg-base-100 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] border border-base-300 transform transition-all"
			use:clickOutside
			onclick_outside={() => commandPaletteStore.close()}
		>
			<div class="border-b border-base-200 p-4 flex items-center gap-3">
				<i class="bi bi-search text-base-content/50 text-lg"></i>
				<input
					bind:this={searchInput}
					type="text"
					class="w-full bg-transparent outline-none text-lg placeholder-base-content/40"
					placeholder="Type a command or search..."
					bind:value={searchQuery}
					spellcheck="false"
					autocomplete="off"
				/>
				<div class="badge badge-ghost text-xs hidden md:flex">ESC to close</div>
			</div>

			<div class="overflow-y-auto p-2 scrollbar-thin">
				{#if !filteredCommands || filteredCommands.length === 0}
					<div class="p-4 text-center text-base-content/50">No commands found.</div>
				{:else}
					{#each filteredCommands as command, i}
						<button
							id="cmd-item-{i}"
							class="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between gap-3 transition-colors {i ===
							selectedIndex
								? 'bg-primary/10 text-primary'
								: 'hover:bg-base-200 text-base-content'}"
							onclick={() => executeCommand(command)}
							onmouseenter={() => (selectedIndex = i)}
						>
							<div class="flex items-center gap-3">
								{#if command.icon}
									<i class="{command.icon} text-lg {i === selectedIndex ? 'text-primary' : 'text-base-content/70'}"></i>
								{:else}
									<i class="bi bi-command text-lg {i === selectedIndex ? 'text-primary' : 'text-base-content/70'}"></i>
								{/if}
								<div>
									<div class="font-medium">{command.title}</div>
									{#if command.description}
										<div class="text-xs opacity-70">{command.description}</div>
									{/if}
								</div>
							</div>
							<div class="flex items-center gap-2">
								{#if command.shortcut}
									<kbd class="kbd kbd-sm">{command.shortcut}</kbd>
								{/if}
								{#if command.category}
									<div class="badge badge-sm badge-ghost opacity-70">{command.category}</div>
								{/if}
							</div>
						</button>
					{/each}
				{/if}
			</div>

			<div class="bg-base-200/50 p-2 px-4 text-xs text-base-content/50 flex justify-between border-t border-base-200">
				<span><kbd class="kbd kbd-xs">↑</kbd> <kbd class="kbd kbd-xs">↓</kbd> to navigate</span>
				<span><kbd class="kbd kbd-xs">↵</kbd> to select</span>
			</div>
		</div>
	</div>
{/if}
