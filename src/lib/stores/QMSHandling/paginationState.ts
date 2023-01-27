import { get, writable } from 'svelte/store';
import { endpointInfo } from '../endpointHandling/endpointInfo';

export const Create_paginationState = (initialValue, paginationArgs, paginationType) => {
	const paginationTypeInfo = get(endpointInfo).paginationTypes.find((pagType) => {
		return pagType.name == paginationType;
	});
	console.log(paginationTypeInfo);
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
