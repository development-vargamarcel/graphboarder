import { Logger } from '$lib/utils/logger';

export interface Tab {
	id: string;
	name: string;
	query: string;
	variables: string;
}

export interface TabState {
	tabs: Tab[];
	activeTabId: string;
}

/**
 * Creates a default new tab.
 */
export const createDefaultTab = (): Tab => {
	const id = crypto.randomUUID();
	return {
		id,
		name: 'New Tab',
		query: '# Write your query here\nquery {\n  \n}',
		variables: '{}'
	};
};

/**
 * Adds a new tab to the list.
 * @param tabs The current list of tabs.
 * @returns The updated state with the new tab added and activated.
 */
export const addTab = (tabs: Tab[]): TabState => {
	const newTab: Tab = {
		id: crypto.randomUUID(),
		name: 'New Tab',
		query: '',
		variables: '{}'
	};
	Logger.info('PlaygroundUtils: Added new tab', { id: newTab.id });
	return {
		tabs: [...tabs, newTab],
		activeTabId: newTab.id
	};
};

/**
 * Closes a specific tab.
 * @param tabs The current list of tabs.
 * @param activeTabId The currently active tab ID.
 * @param targetId The ID of the tab to close.
 * @returns The updated state.
 */
export const closeTab = (tabs: Tab[], activeTabId: string, targetId: string): TabState => {
	if (tabs.length <= 1) {
		Logger.warn('PlaygroundUtils: Cannot close the last tab');
		return { tabs, activeTabId };
	}

	const index = tabs.findIndex((t) => t.id === targetId);
	if (index === -1) return { tabs, activeTabId };

	const newTabs = tabs.filter((t) => t.id !== targetId);
	let newActiveId = activeTabId;

	if (activeTabId === targetId) {
		// If closing the active tab, activate the one before it, or the first one
		const newIndex = index > 0 ? index - 1 : 0;
		if (newTabs[newIndex]) {
			newActiveId = newTabs[newIndex].id;
		}
	}

	Logger.info('PlaygroundUtils: Closed tab', { id: targetId });
	return {
		tabs: newTabs,
		activeTabId: newActiveId
	};
};

/**
 * Duplicates a specific tab.
 * @param tabs The current list of tabs.
 * @param targetId The ID of the tab to duplicate.
 * @returns The updated state with the duplicated tab added and activated.
 */
export const duplicateTab = (tabs: Tab[], targetId: string): TabState => {
	const sourceTab = tabs.find((t) => t.id === targetId);
	if (!sourceTab) return { tabs, activeTabId: tabs[0]?.id || '' };

	const newTab: Tab = {
		...sourceTab,
		id: crypto.randomUUID(),
		name: `${sourceTab.name} (Copy)`
	};

	Logger.info('PlaygroundUtils: Duplicated tab', { sourceId: targetId, newId: newTab.id });
	return {
		tabs: [...tabs, newTab],
		activeTabId: newTab.id
	};
};

/**
 * Closes all tabs except the specified one.
 * @param tabs The current list of tabs.
 * @param targetId The ID of the tab to keep.
 * @returns The updated state.
 */
export const closeOtherTabs = (tabs: Tab[], targetId: string): TabState => {
	const tabToKeep = tabs.find((t) => t.id === targetId);
	if (!tabToKeep) return { tabs, activeTabId: tabs[0]?.id || '' };

	Logger.info('PlaygroundUtils: Closed other tabs', { keptId: targetId });
	return {
		tabs: [tabToKeep],
		activeTabId: tabToKeep.id
	};
};

/**
 * Closes all tabs and resets to a single default tab.
 * @returns The new state with a single default tab.
 */
export const closeAllTabs = (): TabState => {
	const newTab = createDefaultTab();
	Logger.info('PlaygroundUtils: Closed all tabs, reset to default');
	return {
		tabs: [newTab],
		activeTabId: newTab.id
	};
};
