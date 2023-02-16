import { writable } from 'svelte/store';

export const Create_urqlCoreClient = () => {
	const store = writable(null);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update
	};
};
export const urqlCoreClient = Create_urqlCoreClient();
