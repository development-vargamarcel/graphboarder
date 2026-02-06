<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import GraphqlCodeDisplay from '$lib/components/GraphqlCodeDisplay.svelte';
	import { Logger } from '$lib/utils/logger';
	import { browser } from '$app/environment';
	import Page from '$lib/components/Page.svelte';
	import { toast } from '$lib/stores/toastStore';

	let endpointid = $derived($page.params.endpointid);

	interface Tab {
		id: string;
		name: string;
		query: string;
		variables: string;
	}

	let tabs = $state<Tab[]>([]);
	let activeTabId = $state<string>('');

	// Load from localStorage
	const storageKey = $derived(`playground_tabs_${endpointid}`);

	onMount(() => {
		if (browser && endpointid) {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				try {
					const data = JSON.parse(stored);
					if (data.tabs && Array.isArray(data.tabs) && data.tabs.length > 0) {
						tabs = data.tabs;
						activeTabId = data.activeTabId || tabs[0].id;
					} else {
						createDefaultTab();
					}
				} catch (e) {
					createDefaultTab();
				}
			} else {
				createDefaultTab();
			}
		}
	});

	function createDefaultTab() {
		const newTab = {
			id: crypto.randomUUID(),
			name: 'New Tab',
			query: '# Write your query here\nquery {\n  \n}',
			variables: '{}'
		};
		tabs = [newTab];
		activeTabId = newTab.id;
		Logger.info('Playground: Created default tab', { id: newTab.id });
	}

	// Save to localStorage
	$effect(() => {
		if (browser && endpointid && tabs.length > 0) {
			const data = {
				tabs: $state.snapshot(tabs),
				activeTabId
			};
			localStorage.setItem(storageKey, JSON.stringify(data));
		}
	});

	function addTab() {
		const newTab = {
			id: crypto.randomUUID(),
			name: 'New Tab',
			query: '',
			variables: '{}'
		};
		tabs.push(newTab);
		activeTabId = newTab.id;
		Logger.info('Playground: Added new tab', { id: newTab.id });
	}

	function closeTab(id: string, e: Event) {
		e.stopPropagation();
		if (tabs.length === 1) {
			toast.warning('Cannot close the last tab.');
			return;
		}
		const index = tabs.findIndex((t) => t.id === id);
		if (index === -1) return;

		const isActive = id === activeTabId;
		const newTabs = tabs.filter((t) => t.id !== id);
		tabs = newTabs;
		Logger.info('Playground: Closed tab', { id });

		if (isActive) {
			// activate the one before, or the first one
			const newIndex = index > 0 ? index - 1 : 0;
			if (newTabs[newIndex]) {
				activeTabId = newTabs[newIndex].id;
			}
		}
	}

	function renameTab(id: string, newName: string) {
		const tab = tabs.find((t) => t.id === id);
		if (tab) {
			const oldName = tab.name;
			tab.name = newName;
			Logger.debug('Playground: Renamed tab', { id, oldName, newName });
		}
	}

	let activeTabIndex = $derived(tabs.findIndex((t) => t.id === activeTabId));
</script>

<Page MenuItem={true}>
	<div class="flex flex-col h-full w-full bg-base-100">
		<!-- Tab Bar -->
		<div class="flex items-center bg-base-200 border-b border-base-300 overflow-x-auto">
			{#each tabs as tab}
				<button
					class="group relative px-4 py-2 text-sm border-r border-base-300 hover:bg-base-100 flex items-center gap-2 min-w-[120px] max-w-[200px] {activeTabId ===
					tab.id
						? 'bg-base-100 font-bold border-t-2 border-t-primary'
						: 'text-gray-500'}"
					onclick={() => {
						activeTabId = tab.id;
						Logger.debug('Playground: Switched tab', { id: tab.id });
					}}
				>
					<!-- Editable Name -->
					<span
						class="truncate flex-1 text-left outline-none"
						role="textbox"
						tabindex="0"
						contenteditable="plaintext-only"
						onblur={(e) => renameTab(tab.id, e.currentTarget.textContent || 'New Tab')}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								e.currentTarget.blur();
							}
						}}
						onclick={(e) => e.stopPropagation()}
					>
						{tab.name}
					</span>

					<div
						role="button"
						tabindex="0"
						class="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 p-0 w-4 h-4 min-h-0 flex items-center justify-center"
						onclick={(e) => closeTab(tab.id, e)}
						onkeydown={(e) => {
							if (e.key === 'Enter') closeTab(tab.id, e);
						}}
						title="Close Tab"
					>
						✕
					</div>
				</button>
			{/each}
			<button class="btn btn-ghost btn-sm rounded-none" onclick={addTab} title="New Tab">
				<i class="bi bi-plus-lg"></i>
			</button>
		</div>

		<!-- Editor Area -->
		<div class="flex-1 overflow-hidden relative">
			{#if activeTabIndex !== -1}
				{#key tabs[activeTabIndex].id}
					<GraphqlCodeDisplay
						bind:value={tabs[activeTabIndex].query}
						bind:variablesString={tabs[activeTabIndex].variables}
						enableSyncToUI={false}
						enableShareUrl={true}
					/>
				{/key}
			{/if}
		</div>
	</div>
</Page>

<style>
	/* Add any specific styles here if needed */
</style>
