import {
	generate_derivedData,
	sortByName,
	get_QMS_Field,
	getRootType
} from '$lib/utils/usefulFunctions';
import type { EndpointInfoStore, QMSType, RootType, SchemaData, SchemaDataStore } from '$lib/types';
import { get, writable, type Writable } from 'svelte/store';

/**
 * Creates the schema data store, which holds the parsed GraphQL schema and derived metadata.
 * @returns A SchemaDataStore with helper methods for schema processing.
 */
export const create_schemaData = (): SchemaDataStore => {
	const store: Writable<SchemaData> = writable({
		rootTypes: [],
		queryFields: [],
		mutationFields: [],
		subscriptionFields: [],
		schema: {},
		isReady: false
	});
	const { subscribe, set, update } = store;
	let returnObject: SchemaDataStore = {
		subscribe,
		set,
		update,
		/**
		 * Sets the raw schema object from introspection result.
		 * @param schema - The raw schema object.
		 */
		set_schema: (schema: any) => {
			update((s) => ({ ...s, schema }));
		},
		/**
		 * Processes root types from the schema and optionally generates derived data.
		 * @param withDerivedData - Whether to generate derived data (dd_*) for types.
		 * @param set_storeVal - Whether to update the store with the result.
		 * @param endpointInfo - The endpoint configuration store.
		 */
		set_rootTypes: (
			withDerivedData: boolean,
			set_storeVal: boolean = true,
			endpointInfo: EndpointInfoStore
		) => {
			let storeValue = get(store);
			let { schema } = storeValue;
			if (!schema || !schema.types) return [];

			let new_rootTypes = sortByName([...schema.types]) as RootType[];
			if (withDerivedData) {
				new_rootTypes.forEach((el) => {
					Object.assign(
						el,
						generate_derivedData(el, new_rootTypes, false, endpointInfo, storeValue)
					);
					el?.fields?.forEach((field) => {
						Object.assign(
							field,
							generate_derivedData(field, new_rootTypes, false, endpointInfo, storeValue)
						);
						field?.args?.forEach((arg) => {
							Object.assign(
								arg,
								generate_derivedData(arg, new_rootTypes, false, endpointInfo, storeValue)
							);
						});
					});
					el?.inputFields?.forEach((inputField) => {
						Object.assign(
							inputField,
							generate_derivedData(inputField, new_rootTypes, false, endpointInfo, storeValue)
						);
					});
					el?.enumValues?.forEach((enumValue) => {
						Object.assign(
							enumValue,
							generate_derivedData(enumValue, new_rootTypes, false, endpointInfo, storeValue)
						);
					});
				});
			}

			if (set_storeVal) {
				update((s) => ({ ...s, rootTypes: new_rootTypes }));
			}

			return new_rootTypes;
		},
		/**
		 * Extracts and processes fields for Query, Mutation, and Subscription types.
		 * @param withDerivedData - Whether to generate derived data.
		 * @param set_storeVal - Whether to update the store.
		 * @param QMS - Array of operation types to process (default: ['query', 'mutation', 'subscription']).
		 * @param endpointInfo - The endpoint configuration store.
		 */
		set_QMSFields: (
			withDerivedData: boolean,
			set_storeVal: boolean = true,
			QMS: string[] = ['query', 'mutation', 'subscription'],
			endpointInfo: EndpointInfoStore
		) => {
			//QMS -> Query,Mutation,Subscription
			let storeValue = get(store);
			let { rootTypes, schema } = storeValue;
			let result: any = {};
			let isQMSField = true;
			QMS.forEach((_QMS_) => {
				// _QMS_ -> current QMS (one of: Query,Mutation,Subscription)
				let _QMS_Type_name = schema?.[`${_QMS_}Type`]?.name;
				let new_QMS_Fields;
				if (_QMS_Type_name) {
					new_QMS_Fields = sortByName(
						rootTypes?.find((type) => {
							return type?.name == _QMS_Type_name;
						})?.fields
					);
				}

				if (withDerivedData && new_QMS_Fields) {
					new_QMS_Fields.forEach((el: any) => {
						Object.assign(
							el,
							generate_derivedData(el, rootTypes, isQMSField, endpointInfo, storeValue)
						);
						el?.args?.forEach((arg: any) => {
							Object.assign(
								arg,
								generate_derivedData(arg, rootTypes, false, endpointInfo, storeValue)
							);
						});
						el?.fields?.forEach((field: any) => {
							Object.assign(
								field,
								generate_derivedData(field, rootTypes, false, endpointInfo, storeValue)
							);
							field?.args?.forEach((arg: any) => {
								Object.assign(
									arg,
									generate_derivedData(arg, rootTypes, false, endpointInfo, storeValue)
								);
							});
						});
						el?.inputFields?.forEach((inputField: any) => {
							Object.assign(
								inputField,
								generate_derivedData(inputField, rootTypes, false, endpointInfo, storeValue)
							);
						});
						el?.enumValues?.forEach((enumValue: any) => {
							Object.assign(
								enumValue,
								generate_derivedData(enumValue, rootTypes, false, endpointInfo, storeValue)
							);
						});
					});
				}

				result[`${_QMS_}Fields`] = new_QMS_Fields;
			});

			if (set_storeVal) {
				update((s) => ({ ...s, ...result }));
			}
			return result;
		},
		/**
		 * High-level method to process the entire schema (root types and operation fields).
		 * @param endpointInfo - The endpoint configuration store.
		 */
		set_fields: (endpointInfo: EndpointInfoStore) => {
			//set rootTypes,queryFields,mutationFields,subscriptionFields //fields or types?
			let rootTypes = returnObject.set_rootTypes(true, true, endpointInfo);
			let QMSFields = returnObject.set_QMSFields(
				true,
				false,
				['query', 'mutation', 'subscription'],
				endpointInfo
			);
			update((s) => ({
				...s,
				rootTypes,
				...QMSFields,
				isReady: true
			}));
			console.log('updated schemaData', { QMSFields });
		},
		get_rootType: (
			rootTypes: RootType[] | null,
			RootType_Name: string,
			schemaData: SchemaDataStore | SchemaData
		) => {
			return getRootType(rootTypes, RootType_Name, schemaData);
		},
		get_QMS_Field: (name: string, _QMS_: QMSType, schemaData: SchemaDataStore | SchemaData) => {
			return get_QMS_Field(name, _QMS_, schemaData);
		}
	};
	return returnObject;
};
