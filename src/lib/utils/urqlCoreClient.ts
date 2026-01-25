import { writable } from 'svelte/store';
import { Logger } from '$lib/utils/logger';

export const Create_urqlCoreClient = () => {
	const store = writable<any>(null);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set: (client: any) => {
			Logger.debug('Setting urqlCoreClient', client);
			set(client);
		},
		update
	};
};
export const urqlCoreClient = Create_urqlCoreClient();
