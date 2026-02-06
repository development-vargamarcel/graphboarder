import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	createDefaultTab,
	addTab,
	closeTab,
	duplicateTab,
	closeOtherTabs,
	closeAllTabs,
	type Tab
} from './playgroundUtils';

// Mock crypto.randomUUID for deterministic testing or just existence
const mockUUID = vi.fn();
let uuidCounter = 0;
mockUUID.mockImplementation(() => `uuid-${++uuidCounter}`);

vi.stubGlobal('crypto', {
	randomUUID: mockUUID
});

describe('playgroundUtils', () => {
	beforeEach(() => {
		uuidCounter = 0;
		vi.clearAllMocks();
	});

	it('createDefaultTab creates a tab with default values', () => {
		const tab = createDefaultTab();
		expect(tab.id).toBe('uuid-1');
		expect(tab.name).toBe('New Tab');
		expect(tab.query).toContain('query');
	});

	it('addTab adds a new tab and activates it', () => {
		const initialTab = createDefaultTab(); // uuid-1
		const { tabs, activeTabId } = addTab([initialTab]);

		expect(tabs).toHaveLength(2);
		expect(tabs[1].id).toBe('uuid-2');
		expect(activeTabId).toBe('uuid-2');
	});

	it('closeTab closes the specified tab', () => {
		const tab1 = { ...createDefaultTab(), id: '1' };
		const tab2 = { ...createDefaultTab(), id: '2' };
		const tab3 = { ...createDefaultTab(), id: '3' };
		const currentTabs = [tab1, tab2, tab3];

		// Close tab 2, active was 2
		const result1 = closeTab(currentTabs, '2', '2');
		expect(result1.tabs).toHaveLength(2);
		expect(result1.tabs.map((t) => t.id)).toEqual(['1', '3']);
		expect(result1.activeTabId).toBe('1'); // Should go to previous

		// Close tab 3, active was 1
		const result2 = closeTab(result1.tabs, '1', '3');
		expect(result2.tabs).toHaveLength(1);
		expect(result2.tabs[0].id).toBe('1');
		expect(result2.activeTabId).toBe('1');
	});

	it('closeTab prevents closing the last tab', () => {
		const tab1 = { ...createDefaultTab(), id: '1' };
		const result = closeTab([tab1], '1', '1');
		expect(result.tabs).toHaveLength(1);
		expect(result.activeTabId).toBe('1');
	});

	it('duplicateTab duplicates the tab and activates the copy', () => {
		const tab1 = { ...createDefaultTab(), id: '1', name: 'My Query', query: '{ test }' };
		const result = duplicateTab([tab1], '1');

		expect(result.tabs).toHaveLength(2);
		expect(result.tabs[1].name).toBe('My Query (Copy)');
		expect(result.tabs[1].query).toBe('{ test }');
		expect(result.activeTabId).toBe(result.tabs[1].id);
	});

	it('closeOtherTabs closes all except the target', () => {
		const tab1 = { ...createDefaultTab(), id: '1' };
		const tab2 = { ...createDefaultTab(), id: '2' };
		const tab3 = { ...createDefaultTab(), id: '3' };

		const result = closeOtherTabs([tab1, tab2, tab3], '2');
		expect(result.tabs).toHaveLength(1);
		expect(result.tabs[0].id).toBe('2');
		expect(result.activeTabId).toBe('2');
	});

	it('closeAllTabs resets to a single default tab', () => {
		const result = closeAllTabs();
		expect(result.tabs).toHaveLength(1);
		expect(result.tabs[0].name).toBe('New Tab');
		expect(result.activeTabId).toBe(result.tabs[0].id);
	});
});
