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
	removeFromHistory
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
			operationName: 'test',
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
			operationName: 'test',
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
			operationName: 'test',
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
