import { writable } from 'svelte/store';
import { paginationTypes } from '$lib/stores/pagination/paginationTypes';

export const Create_paginationState = (initialValue, paginationArgs, paginationType) => {
	const paginationTypeInfo = paginationTypes.find((pagType) => {
		return pagType.name == paginationType;
	});
	const store = writable(
		initialValue ? initialValue : paginationTypeInfo?.get_initialState(paginationArgs)
	);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		nextPage: (returnedDataBatch_last, QMS_name, QMS_type) => {
			update((val) => {
				return paginationTypeInfo.get_nextPageState(
					val,
					paginationArgs,
					returnedDataBatch_last,
					QMS_name,
					QMS_type
				);
			});
		},
		prevPage: (returnedDataBatch_last, QMS_name, QMS_type) => {
			update((val) => {
				return paginationTypeInfo.get_prevPageState(
					val,
					paginationArgs,
					returnedDataBatch_last,
					QMS_name,
					QMS_type
				);
			});
		},
		resetToDefault: () => {
			update((val) => {
				return paginationTypeInfo.get_defaultPaginationStateForDynamic(val, paginationArgs);
			});
		}
	};
};
