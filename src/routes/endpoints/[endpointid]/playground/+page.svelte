<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import GraphqlCodeDisplay from '$lib/components/GraphqlCodeDisplay.svelte';
	import { Logger } from '$lib/utils/logger';
	import { browser } from '$app/environment';
	import Page from '$lib/components/Page.svelte';
	import { toast } from '$lib/stores/toastStore';
	import {
		addTab,
		closeAllTabs,
		closeOtherTabs,
		closeTab,
		createDefaultTab,
		duplicateTab,
		type Tab
	} from '$lib/utils/playgroundUtils';

	let endpointid = $derived($page.params.endpointid);

	let tabs = $state<Tab[]>([]);
	let activeTabId = $state<string>('');

	// Context Menu State
	let contextMenu = $state({
		visible: false,
		x: 0,
		y: 0,
		targetTabId: ''
	});

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
						initDefault();
					}
				} catch (e) {
					initDefault();
				}
			} else {
				initDefault();
			}
		}

		// Close context menu on click elsewhere
		const handleGlobalClick = () => closeContextMenu();
		document.addEventListener('click', handleGlobalClick);
		return () => document.removeEventListener('click', handleGlobalClick);
	});

	function initDefault() {
		const defaultTab = createDefaultTab();
		tabs = [defaultTab];
		activeTabId = defaultTab.id;
		Logger.info('Playground: Created default tab', { id: defaultTab.id });
	}

	function closeContextMenu() {
		contextMenu.visible = false;
	}

	/**
	 * Handles the right-click context menu for tabs.
	 * Prevents the default browser menu and positions the custom menu.
	 * @param e - The mouse event
	 * @param tabId - The ID of the tab that was right-clicked
	 */
	function handleContextMenu(e: MouseEvent, tabId: string) {
		e.preventDefault();
		e.stopPropagation(); // Prevent native browser menu
		contextMenu = {
			visible: true,
			x: e.clientX,
			y: e.clientY,
			targetTabId: tabId
		};
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

	function handleAddTab() {
		const result = addTab(tabs);
		tabs = result.tabs;
		activeTabId = result.activeTabId;
	}

	function handleCloseTab(id: string, e?: Event) {
		if (e) e.stopPropagation();
		if (tabs.length === 1) {
			toast.warning('Cannot close the last tab.');
			return;
		}
		const result = closeTab(tabs, activeTabId, id);
		tabs = result.tabs;
		activeTabId = result.activeTabId;
	}

	function handleDuplicateTab() {
		const result = duplicateTab(tabs, contextMenu.targetTabId);
		tabs = result.tabs;
		activeTabId = result.activeTabId;
		closeContextMenu();
		toast.success('Tab duplicated');
	}

	function handleCloseOtherTabs() {
		const result = closeOtherTabs(tabs, contextMenu.targetTabId);
		tabs = result.tabs;
		activeTabId = result.activeTabId;
		closeContextMenu();
		toast.success('Other tabs closed');
	}

	function handleCloseAllTabs() {
		if (
			!confirm('Are you sure you want to close all tabs? This will reset the playground.')
		)
			return;
		const result = closeAllTabs();
		tabs = result.tabs;
		activeTabId = result.activeTabId;
		closeContextMenu();
		toast.info('All tabs reset');
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
	<div class="flex flex-col h-full w-full bg-base-100 relative">
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
					oncontextmenu={(e) => handleContextMenu(e, tab.id)}
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
						onclick={(e) => handleCloseTab(tab.id, e)}
						onkeydown={(e) => {
							if (e.key === 'Enter') handleCloseTab(tab.id, e);
						}}
						title="Close Tab"
					>
						✕
					</div>
				</button>
			{/each}
			<button class="btn btn-ghost btn-sm rounded-none" onclick={handleAddTab} title="New Tab">
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

		<!-- Context Menu -->
		{#if contextMenu.visible}
			<div
				class="fixed z-50 bg-base-100 shadow-xl border border-base-300 rounded-lg py-1 min-w-[150px] flex flex-col"
				style="top: {contextMenu.y}px; left: {contextMenu.x}px;"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="menu"
				tabindex="-1"
			>
				<button
					class="btn btn-sm btn-ghost justify-start rounded-none font-normal"
					onclick={handleDuplicateTab}
				>
					<i class="bi bi-files"></i> Duplicate Tab
				</button>
				<button
					class="btn btn-sm btn-ghost justify-start rounded-none font-normal"
					onclick={handleCloseOtherTabs}
				>
					<i class="bi bi-x-circle"></i> Close Other Tabs
				</button>
				<div class="divider my-0"></div>
				<button
					class="btn btn-sm btn-ghost justify-start rounded-none font-normal text-error"
					onclick={handleCloseAllTabs}
				>
					<i class="bi bi-trash"></i> Close All Tabs
				</button>
			</div>
		{/if}
	</div>
</Page>

<style>
	/* Add any specific styles here if needed */
</style>
