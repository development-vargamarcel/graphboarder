import { writable } from 'svelte/store';

export const Create_tableColsData_Store = (_pagination_state_Store, initialCols = []) => {
	const store = writable(initialCols);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		addColumns: (newCollsData) => {
			_pagination_state_Store.resetToDefault();
			update((storeData) => {
				console.log('qwerrt', { storeData });
				return [...storeData, ...newCollsData];
			});
		},

		addColumn: (newCollData) => {
			_pagination_state_Store.resetToDefault();
			update((storeData) => {
				console.log('qwerrt', { storeData });
				return [...storeData, newCollData];
			});
		},
		removeColumn: (colToRemoveData_title) => {
			_pagination_state_Store.resetToDefault();
			update((storeData) => {
				return storeData.filter((colData) => {
					return colData.title !== colToRemoveData_title;
				});
			});
		}
	};
};
