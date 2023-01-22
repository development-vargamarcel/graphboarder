import { derived, get } from 'svelte/store';
import { endpointInfo } from '../endpointInfo';
export const Create_paginationState_derived = (
	_pagination_state_Store,
	paginationArgs,
	paginationType
) => {
	return derived([_pagination_state_Store], ([$_pagination_state_Store], set) => {
		if (
			!get(endpointInfo).paginationTypes
				.find((pagType) => {
					return pagType.name == paginationType;
				})
				.isFirstPage(_pagination_state_Store, paginationArgs)
		) {
			set($_pagination_state_Store);
		}
	});
};
