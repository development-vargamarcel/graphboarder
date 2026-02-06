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
 * Includes both history items and collections.
 * @returns JSON string of the backup object
 */
export const exportHistory = (): string => {
	const history = get(queryHistory);
	const collections = get(queryCollections);

	Logger.info('Exporting history backup', {
		historyCount: history.length,
		collectionsCount: collections.length
	});

	const backup = {
		version: 1,
		timestamp: Date.now(),
		history,
		collections
	};

	return JSON.stringify(backup, null, 2);
};

/**
 * Imports history from a JSON string.
 * Supports legacy array format (merges history) and new versioned object format (merges history and collections).
 * @param json - The JSON string to import
 * @returns Object indicating success status and message
 */
export const importHistory = (json: string): { success: boolean; message: string } => {
	try {
		const data = JSON.parse(json);

		// Handle legacy format (Array of HistoryItem)
		if (Array.isArray(data)) {
			Logger.info('Importing legacy history', { count: data.length });
			// Strategy: Merge legacy items. If ID exists, skip. If not, add.

			let addedCount = 0;
			queryHistory.update((currentHistory) => {
				const newItems = data.filter((item) => !currentHistory.some((h) => h.id === item.id));
				addedCount = newItems.length;
				return [...currentHistory, ...newItems];
			});

			return { success: true, message: `Imported ${addedCount} items (legacy format).` };
		}

		// Handle new format (Object with version)
		if (data.version && data.history) {
			const importedHistory = data.history as HistoryItem[];
			const importedCollections = (data.collections || []) as QueryCollection[];

			Logger.info('Importing backup', {
				version: data.version,
				historyCount: importedHistory.length,
				collectionsCount: importedCollections.length
			});

			let addedCollections = 0;
			let addedHistory = 0;

			// Merge Collections
			queryCollections.update((currentCollections) => {
				const newCollections = importedCollections.filter(
					(col) => !currentCollections.some((c) => c.id === col.id)
				);
				addedCollections = newCollections.length;
				return [...currentCollections, ...newCollections];
			});

			// Merge History
			queryHistory.update((currentHistory) => {
				const newItems = importedHistory.filter(
					(item) => !currentHistory.some((h) => h.id === item.id)
				);
				addedHistory = newItems.length;
				return [...currentHistory, ...newItems];
			});

			return {
				success: true,
				message: `Imported ${addedCollections} collections and ${addedHistory} queries.`
			};
		}

		Logger.error('Import failed: invalid JSON format');
		return { success: false, message: 'Invalid file format.' };
	} catch (e) {
		Logger.error('Import failed', e);
		return { success: false, message: 'Failed to parse JSON file.' };
	}
};
