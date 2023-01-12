import { writable } from 'svelte/store';

export const Create_introspectionResult = () => {
	const store = writable({ rootTypes: [], queryFields: [], mutationFields: [], schema: {} });
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		set_schema: (schema) => {},
		set_rootTypes: (withDerivedData: false, schema) => {},
		set_queryFields: (withDerivedData: false, rootTypes) => {},
		set_mutationFields: (withDerivedData: false, rootTypes) => {},
		set_subscriptionFields: (withDerivedData: false, rootTypes) => {},
		set_fields: (withDerivedData: false, schema) => {
			//set rootTypes,queryFields,mutationFields,subscriptionFields //fields or types?
		}
	};
};
export const introspectionResult = Create_introspectionResult();
