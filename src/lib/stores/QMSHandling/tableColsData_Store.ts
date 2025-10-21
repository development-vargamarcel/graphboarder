import { writable } from 'svelte/store';
import type { TableColumnData, TableColsDataStore, PaginationStateStore } from '$lib/types';

export const Create_tableColsData_Store = (
	_paginationState_Store: PaginationStateStore,
	initialCols: TableColumnData[] = []
): TableColsDataStore => {
	const store = writable<TableColumnData[]>(initialCols);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		addColumns: (newCollsData: TableColumnData[]) => {
			_paginationState_Store.resetToDefault();
			update((storeData) => {
				console.log('qwerrt', { storeData });
				return [...storeData, ...newCollsData];
			});
		},

		addColumn: (newCollData: TableColumnData) => {
			_paginationState_Store.resetToDefault();
			update((storeData) => {
				console.log('qwerrt', { storeData });
				return [...storeData, newCollData];
			});
		},
		removeColumn: (colToRemoveData_title: string) => {
			_paginationState_Store.resetToDefault();
			update((storeData) => {
				return storeData.filter((colData) => {
					return colData.title !== colToRemoveData_title;
				});
			});
		}
	};
};
