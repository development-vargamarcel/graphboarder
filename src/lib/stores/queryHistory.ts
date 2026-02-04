import { persisted } from 'svelte-persisted-store';
import { Logger } from '../utils/logger';
import { get } from 'svelte/store';

/**
 * Interface representing a user-created collection of queries.
 */
export interface QueryCollection {
	/** Unique identifier for the collection */
	id: string;
	/** Name of the collection */
	name: string;
	/** Timestamp when the collection was created */
	createdAt: number;
}

/**
 * Interface representing a saved GraphQL query in history.
 */
export interface HistoryItem {
	/** Unique identifier for the history item */
	id: string;
	/** The GraphQL query string */
	query: string;
	/** Variables used in the query */
	variables?: Record<string, any>;
	/** ID of the endpoint used */
	endpointId: string;
	/** Name of the operation */
	operationName: string;
	/** Timestamp when the query was executed */
	timestamp: number;
	/** Number of rows returned (optional) */
	rowsCount?: number;
	/** User-defined name for the query */
	name?: string;
	/** Whether the query is marked as favorite */
	isFavorite?: boolean;
	/** The ID of the collection this item belongs to (optional) */
	collectionId?: string | null;
}

/**
 * Persisted store for query history.
 */
export const queryHistory = persisted<HistoryItem[]>('queryHistory', []);

/**
 * Persisted store for query collections.
 */
export const queryCollections = persisted<QueryCollection[]>('queryCollections', []);

/**
 * Adds a new item to the history.
 * If an identical query exists, it moves it to the top and updates the timestamp,
 * preserving custom fields like 'name' and 'isFavorite'.
 *
 * @param item - The history item to add (excluding id and timestamp)
 */
export const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
	Logger.debug('Adding to history', item);
	queryHistory.update((history) => {
		// Find if this query already exists
		const existingIndex = history.findIndex(
			(h) => h.query === item.query && h.endpointId === item.endpointId
		);

		if (existingIndex !== -1) {
			const existing = history[existingIndex];
			// Move to top and update timestamp
			const updated = {
				...existing,
				...item,
				timestamp: Date.now(),
				// Ensure we keep existing custom fields if they aren't provided in the new item
				name: existing.name,
				isFavorite: existing.isFavorite,
				collectionId: existing.collectionId
			};

			const newHistory = [...history];
			newHistory.splice(existingIndex, 1);
			return [updated, ...newHistory];
		}

		// Add new item
		return [
			{
				...item,
				id: crypto.randomUUID(),
				timestamp: Date.now(),
				isFavorite: false,
				collectionId: null
			},
			...history
		].slice(0, 50); // Keep last 50
	});
};

/**
 * Creates a new query collection.
 * @param name - The name of the collection
 * @returns The ID of the created collection
 */
export const createCollection = (name: string): string => {
	const id = crypto.randomUUID();
	const newCollection: QueryCollection = {
		id,
		name,
		createdAt: Date.now()
	};
	Logger.debug('Creating collection', newCollection);
	queryCollections.update((collections) => [...collections, newCollection]);
	return id;
};

/**
 * Deletes a collection and moves its items to "Unsorted" (null collectionId).
 * @param id - The ID of the collection to delete
 */
export const deleteCollection = (id: string) => {
	Logger.debug('Deleting collection', { id });
	// Remove the collection
	queryCollections.update((collections) => collections.filter((c) => c.id !== id));
	// Remove collectionId from items that were in this collection
	queryHistory.update((history) =>
		history.map((item) => (item.collectionId === id ? { ...item, collectionId: null } : item))
	);
};

/**
 * Renames a collection.
 * @param id - The ID of the collection
 * @param name - The new name
 */
export const renameCollection = (id: string, name: string) => {
	Logger.debug('Renaming collection', { id, name });
	queryCollections.update((collections) =>
		collections.map((c) => (c.id === id ? { ...c, name } : c))
	);
};

/**
 * Moves a history item to a collection (or removes it from one).
 * @param itemId - The ID of the history item
 * @param collectionId - The ID of the target collection, or null to remove from collection
 */
export const moveItemToCollection = (itemId: string, collectionId: string | null) => {
	Logger.debug('Moving item to collection', { itemId, collectionId });
	queryHistory.update((history) =>
		history.map((item) => (item.id === itemId ? { ...item, collectionId } : item))
	);
};

/**
 * Removes an item from history by ID.
 * @param id - The ID of the item to remove
 */
export const removeFromHistory = (id: string) => {
	Logger.debug('Removing from history', { id });
	queryHistory.update((history) => history.filter((item) => item.id !== id));
};

/**
 * Clears the entire history.
 */
export const clearHistory = () => {
	Logger.debug('Clearing history');
	queryHistory.set([]);
};

/**
 * Toggles the favorite status of a history item.
 * @param id - The ID of the item
 */
export const toggleFavorite = (id: string) => {
	Logger.debug('Toggling favorite', { id });
	queryHistory.update((history) =>
		history.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
	);
};

/**
 * Updates properties of a history item.
 * @param id - The ID of the item
 * @param updates - The properties to update
 */
export const updateHistoryItem = (id: string, updates: Partial<HistoryItem>) => {
	Logger.debug('Updating history item', { id, updates });
	queryHistory.update((history) =>
		history.map((item) => (item.id === id ? { ...item, ...updates } : item))
	);
};

/**
 * Exports the current history as a JSON string.
 * @returns JSON string of history items
 */
export const exportHistory = (): string => {
	const history = get(queryHistory);
	Logger.debug('Exporting history', { count: history.length });
	return JSON.stringify(history, null, 2);
};

/**
 * Imports history from a JSON string.
 * Replaces the current history.
 * @param json - The JSON string to import
 */
export const importHistory = (json: string) => {
	try {
		const items = JSON.parse(json);
		if (Array.isArray(items)) {
			Logger.debug('Importing history', { count: items.length });
			queryHistory.set(items);
		} else {
			Logger.error('Import failed: invalid JSON format (not an array)');
		}
	} catch (e) {
		Logger.error('Import failed', e);
	}
};
