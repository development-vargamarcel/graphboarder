import { writable } from 'svelte/store';
import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';
import type {
	PaginationState,
	PaginationStateStore,
	FieldWithDerivedData,
	EndpointInfoStore,
	SchemaData,
	QMSType
} from '$lib/types';

export const Create_paginationState = (
	initialValue: PaginationState | null,
	paginationArgs: FieldWithDerivedData[],
	paginationType: string,
	endpointInfo: EndpointInfoStore,
	schemaData: SchemaData
): PaginationStateStore => {
	const paginationTypeInfo = get_paginationTypes(endpointInfo, schemaData).find((pagType) => {
		return pagType.name == paginationType;
	});
	const store = writable<PaginationState>(
		initialValue ? initialValue : paginationTypeInfo?.get_initialState(paginationArgs) || {}
	);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		nextPage: (returnedDataBatch_last: unknown, QMS_name: string, QMS_type: QMSType) => {
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
		prevPage: (returnedDataBatch_last: unknown, QMS_name: string, QMS_type: QMSType) => {
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
