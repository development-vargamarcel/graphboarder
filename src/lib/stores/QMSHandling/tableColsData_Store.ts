import { writable } from 'svelte/store';

export const Create_tableColsData_Store = (_paginationState_Store, initialCols = []) => {
	const store = writable(initialCols);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		addColumns: (newCollsData) => {
			_paginationState_Store.resetToDefault();
			update((storeData) => {
				console.log('qwerrt', { storeData });
				return [...storeData, ...newCollsData];
			});
		},

		addColumn: (newCollData) => {
			_paginationState_Store.resetToDefault();
			update((storeData) => {
				console.log('qwerrt', { storeData });
				return [...storeData, newCollData];
			});
		},
		removeColumn: (colToRemoveData_title) => {
			_paginationState_Store.resetToDefault();
			update((storeData) => {
				return storeData.filter((colData) => {
					return colData.title !== colToRemoveData_title;
				});
			});
		}
	};
};
