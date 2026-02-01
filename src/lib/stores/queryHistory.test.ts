import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	queryHistory,
	addToHistory,
	removeFromHistory,
	clearHistory,
	toggleFavorite,
	updateHistoryItem,
	exportHistory,
	importHistory
} from './queryHistory';

describe('queryHistory Store', () => {
	beforeEach(() => {
		clearHistory();
	});

	it('should add items to history', () => {
		const item = {
			query: 'query { test }',
			endpointId: '1',
			operationName: 'testQuery'
		};
		addToHistory(item);

		const history = get(queryHistory);
		expect(history).toHaveLength(1);
		expect(history[0].query).toBe(item.query);
		expect(history[0].isFavorite).toBe(false);
		expect(history[0].timestamp).toBeDefined();
		expect(history[0].id).toBeDefined();
	});

	it('should move existing item to top and update timestamp', async () => {
		const item1 = {
			query: 'query { test1 }',
			endpointId: '1',
			operationName: 'testQuery1'
		};
		const item2 = {
			query: 'query { test2 }',
			endpointId: '1',
			operationName: 'testQuery2'
		};

		addToHistory(item1);
		// wait a bit to ensure timestamp diff (though Date.now() might be same, code relies on order mostly)
		addToHistory(item2);

		let history = get(queryHistory);
		expect(history[0].query).toBe(item2.query);
		expect(history[1].query).toBe(item1.query);
		const firstTimestamp = history[1].timestamp;

		// Add item1 again
		addToHistory(item1);

		history = get(queryHistory);
		expect(history).toHaveLength(2);
		expect(history[0].query).toBe(item1.query);
		expect(history[1].query).toBe(item2.query);
		expect(history[0].timestamp).toBeGreaterThanOrEqual(firstTimestamp);
	});

	it('should preserve favorite status when updating existing item', () => {
		const item = {
			query: 'query { test }',
			endpointId: '1',
			operationName: 'testQuery'
		};
		addToHistory(item);

		let history = get(queryHistory);
		const id = history[0].id;
		toggleFavorite(id);

		history = get(queryHistory);
		expect(history[0].isFavorite).toBe(true);

		// Add same item again
		addToHistory(item);

		history = get(queryHistory);
		expect(history[0].isFavorite).toBe(true);
	});

	it('should toggle favorite', () => {
		const item = {
			query: 'query { test }',
			endpointId: '1',
			operationName: 'testQuery'
		};
		addToHistory(item);
		const id = get(queryHistory)[0].id;

		toggleFavorite(id);
		expect(get(queryHistory)[0].isFavorite).toBe(true);

		toggleFavorite(id);
		expect(get(queryHistory)[0].isFavorite).toBe(false);
	});

	it('should update history item', () => {
		const item = {
			query: 'query { test }',
			endpointId: '1',
			operationName: 'testQuery'
		};
		addToHistory(item);
		const id = get(queryHistory)[0].id;

		updateHistoryItem(id, { name: 'My Query' });
		expect(get(queryHistory)[0].name).toBe('My Query');
	});

	it('should export and import history', () => {
		const item = {
			query: 'query { test }',
			endpointId: '1',
			operationName: 'testQuery',
			name: 'Exported'
		};
		addToHistory(item);

		const json = exportHistory();
		clearHistory();
		expect(get(queryHistory)).toHaveLength(0);

		importHistory(json);
		const history = get(queryHistory);
		expect(history).toHaveLength(1);
		expect(history[0].name).toBe('Exported');
	});

	it('should store and retrieve variables', () => {
		const item = {
			query: 'query { test($var: String) { field(arg: $var) } }',
			endpointId: '1',
			operationName: 'testQuery',
			variables: { var: 'value' }
		};
		addToHistory(item);

		const history = get(queryHistory);
		expect(history).toHaveLength(1);
		expect(history[0].variables).toEqual({ var: 'value' });
	});
});
