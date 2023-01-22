import { writable } from 'svelte/store';

type paginationInfo = {
	paginationType:
	| 'offsetBased'
	| 'edgeBased'
	| 'idBased'
	| 'pageBased'
	| 'notAvailable'
	| 'unknown';
	paginationData: Record<string, unknown>;
};
export const Create_paginationInfo = (paginationInfo: paginationInfo) => {
	const store = writable(paginationInfo);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update
	};
};
