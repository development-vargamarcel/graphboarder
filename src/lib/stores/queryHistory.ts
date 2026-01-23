import { persisted } from 'svelte-persisted-store';

export interface HistoryItem {
	id: string;
	query: string;
	variables?: Record<string, any>;
	endpointId: string;
	operationName: string;
	timestamp: number;
	rowsCount?: number;
}

export const queryHistory = persisted<HistoryItem[]>('queryHistory', []);

export const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
	queryHistory.update((history) => {
		// Avoid exact duplicates at the top
		if (history.length > 0 && history[0].query === item.query && history[0].endpointId === item.endpointId) {
			return [{ ...history[0], timestamp: Date.now(), ...item }, ...history.slice(1)];
		}
		return [
			{
				...item,
				id: crypto.randomUUID(),
				timestamp: Date.now()
			},
			...history
		].slice(0, 50); // Keep last 50
	});
};

export const removeFromHistory = (id: string) => {
	queryHistory.update((history) => history.filter((item) => item.id !== id));
};

export const clearHistory = () => {
	queryHistory.set([]);
};
