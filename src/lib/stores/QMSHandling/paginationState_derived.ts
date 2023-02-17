//!!! do not rely on this store's value,it's purpose is only to provide a proper time to notify subscribers.Instead you should use _paginationState_Store as the value or call this store's get_value().

import { derived, get } from 'svelte/store';
import { get_paginationTypes } from '../pagination/paginationTypes';
export const Create_paginationState_derived = (
	_paginationState_Store,
	paginationArgs,
	paginationType, endpointInfo, schemaData
) => {
	return {
		...derived([_paginationState_Store], ([$_paginationState_Store], set) => {
			if (
				!get_paginationTypes(endpointInfo, schemaData).find((pagType) => {
					return pagType.name == paginationType;
				})
					.isFirstPage(_paginationState_Store, paginationArgs)
			) {
				set($_paginationState_Store);
			}
		}), get_value: () => { return get(_paginationState_Store) }
	}
};
