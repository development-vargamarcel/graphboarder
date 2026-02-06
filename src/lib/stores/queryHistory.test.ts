import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	queryHistory,
	queryCollections,
	addToHistory,
	createCollection,
	deleteCollection,
	renameCollection,
	moveItemToCollection,
	removeFromHistory,
	exportHistory,
	importHistory
} from './queryHistory';

describe('Query History Collections', () => {
	beforeEach(() => {
		queryHistory.set([]);
		queryCollections.set([]);
		localStorage.clear();
	});

	it('should create a collection', () => {
		const id = createCollection('My Collection');
		const collections = get(queryCollections);
		expect(collections).toHaveLength(1);
		expect(collections[0].name).toBe('My Collection');
		expect(collections[0].id).toBe(id);
	});

	it('should rename a collection', () => {
		const id = createCollection('Old Name');
		renameCollection(id, 'New Name');
		const collections = get(queryCollections);
		expect(collections[0].name).toBe('New Name');
	});

	it('should delete a collection', () => {
		const id = createCollection('To Delete');
		deleteCollection(id);
		const collections = get(queryCollections);
		expect(collections).toHaveLength(0);
	});

	it('should move an item to a collection', () => {
		addToHistory({
			query: '{ test }',
			endpointId: '1',
			operationName: 'test'
		});
		const history = get(queryHistory);
		const itemId = history[0].id;
		const collectionId = createCollection('My Collection');

		moveItemToCollection(itemId, collectionId);

		const updatedHistory = get(queryHistory);
		expect(updatedHistory[0].collectionId).toBe(collectionId);
	});

	it('should reset collectionId when collection is deleted', () => {
		addToHistory({
			query: '{ test }',
			endpointId: '1',
			operationName: 'test'
		});
		let history = get(queryHistory);
		const itemId = history[0].id;
		const collectionId = createCollection('My Collection');

		moveItemToCollection(itemId, collectionId);
		deleteCollection(collectionId);

		history = get(queryHistory);
		expect(history[0].collectionId).toBeNull();
	});

	it('should remove item from collection (move to unsorted)', () => {
		addToHistory({
			query: '{ test }',
			endpointId: '1',
			operationName: 'test'
		});
		let history = get(queryHistory);
		const itemId = history[0].id;
		const collectionId = createCollection('My Collection');

		moveItemToCollection(itemId, collectionId);
		moveItemToCollection(itemId, null);

		history = get(queryHistory);
		expect(history[0].collectionId).toBeNull();
	});
});

describe('History Import/Export', () => {
	beforeEach(() => {
		queryHistory.set([]);
		queryCollections.set([]);
	});

	it('should export and import history with collections (versioned format)', () => {
		// Setup data
		const collectionId = createCollection('Export Collection');
		addToHistory({
			query: '{ export }',
			endpointId: '1',
			operationName: 'export'
		});
		const history = get(queryHistory);
		moveItemToCollection(history[0].id, collectionId);

		// Export
		const json = exportHistory();
		const data = JSON.parse(json);

		expect(data.version).toBe(1);
		expect(data.collections).toHaveLength(1);
		expect(data.history).toHaveLength(1);

		// Clear stores
		queryHistory.set([]);
		queryCollections.set([]);

		// Import
		const result = importHistory(json);
		expect(result.success).toBe(true);

		const importedHistory = get(queryHistory);
		const importedCollections = get(queryCollections);

		expect(importedCollections).toHaveLength(1);
		expect(importedCollections[0].name).toBe('Export Collection');
		expect(importedHistory).toHaveLength(1);
		expect(importedHistory[0].collectionId).toBe(importedCollections[0].id);
	});

	it('should import legacy history format (array)', () => {
		const legacyData = [
			{
				id: '1',
				query: '{ legacy }',
				endpointId: '1',
				operationName: 'legacy',
				timestamp: 123
			}
		];
		const json = JSON.stringify(legacyData);

		const result = importHistory(json);
		expect(result.success).toBe(true);
		expect(result.message).toContain('legacy format');

		const history = get(queryHistory);
		expect(history).toHaveLength(1);
		expect(history[0].query).toBe('{ legacy }');
	});

	it('should merge data on import (not duplicate IDs)', () => {
		const collectionId = createCollection('Shared Collection');
		addToHistory({
			query: '{ shared }',
			endpointId: '1',
			operationName: 'shared'
		});
		const history = get(queryHistory);

		// Export current state
		const json = exportHistory();

		// Import it back (should not duplicate)
		const result = importHistory(json);
		expect(result.success).toBe(true);

		const finalHistory = get(queryHistory);
		const finalCollections = get(queryCollections);

		expect(finalHistory).toHaveLength(1);
		expect(finalCollections).toHaveLength(1);
	});
});
