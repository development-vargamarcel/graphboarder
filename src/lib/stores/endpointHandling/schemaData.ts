import {
	generate_derivedData,
	sortByName
} from '$lib/utils/usefulFunctions';
import type { EndpointInfoStore, QMSType, RootType, SchemaData, SchemaDataStore } from '$lib/types';
import { get, writable, type Writable } from 'svelte/store';

export const create_schemaData = (): SchemaDataStore => {
	const store: Writable<SchemaData> = writable({ rootTypes: [], queryFields: [], mutationFields: [], subscriptionFields: [], schema: {}, isReady: false });
	const { subscribe, set, update } = store;
	let returnObject: SchemaDataStore = {
		subscribe,
		set,
		update,
		set_schema: (schema: any) => {
			update(s => ({ ...s, schema }));
		},
		set_rootTypes: (withDerivedData: boolean, set_storeVal: boolean = true, endpointInfo: EndpointInfoStore) => {
			let storeValue = get(store);
			let { schema } = storeValue;
			if (!schema || !schema.types) return [];

			let new_rootTypes = sortByName([...schema.types]) as RootType[];
			if (withDerivedData) {
				new_rootTypes.forEach((el) => {
					Object.assign(el, generate_derivedData(el, new_rootTypes, false, endpointInfo, storeValue));
					el?.args?.forEach((arg) => {
						Object.assign(arg, generate_derivedData(arg, new_rootTypes, false, endpointInfo, storeValue));
					});
					el?.fields?.forEach((field) => {
						Object.assign(field, generate_derivedData(field, new_rootTypes, false, endpointInfo, storeValue));
						field?.args?.forEach((arg) => {
							Object.assign(arg, generate_derivedData(arg, new_rootTypes, false, endpointInfo, storeValue));
						});
					});
					el?.inputFields?.forEach((inputField) => {
						Object.assign(inputField, generate_derivedData(inputField, new_rootTypes, false, endpointInfo, storeValue));
					});
					el?.enumValues?.forEach((enumValue) => {
						Object.assign(enumValue, generate_derivedData(enumValue, new_rootTypes, false, endpointInfo, storeValue));
					});

				});
			}

			if (set_storeVal) {
				update(s => ({ ...s, rootTypes: new_rootTypes }));
			}

			return new_rootTypes;
		},
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
						Object.assign(el, generate_derivedData(el, rootTypes, isQMSField, endpointInfo, storeValue));
						el?.args?.forEach((arg: any) => {
							Object.assign(arg, generate_derivedData(arg, rootTypes, false, endpointInfo, storeValue));
						});
						el?.fields?.forEach((field: any) => {
							Object.assign(field, generate_derivedData(field, rootTypes, false, endpointInfo, storeValue));
							field?.args?.forEach((arg: any) => {
								Object.assign(arg, generate_derivedData(arg, rootTypes, false, endpointInfo, storeValue));
							});
						});
						el?.inputFields?.forEach((inputField: any) => {
							Object.assign(inputField, generate_derivedData(inputField, rootTypes, false, endpointInfo, storeValue));
						});
						el?.enumValues?.forEach((enumValue: any) => {
							Object.assign(enumValue, generate_derivedData(enumValue, rootTypes, false, endpointInfo, storeValue));
						});
					});
				}

				result[`${_QMS_}Fields`] = new_QMS_Fields;
			});

			if (set_storeVal) {
				update(s => ({ ...s, ...result }));
			}
			return result;
		},
		set_fields: (endpointInfo: EndpointInfoStore) => {
			//set rootTypes,queryFields,mutationFields,subscriptionFields //fields or types?
			let rootTypes = returnObject.set_rootTypes(true, true, endpointInfo);
			let QMSFields = returnObject.set_QMSFields(true, false, [
				'query',
				'mutation',
				'subscription'
			], endpointInfo);
			update(s => ({
				...s,
				rootTypes,
				...QMSFields,
				isReady: true
			}));
			console.log('updated schemaData', { QMSFields })

		},
		get_rootType: (rootTypes: RootType[] | null, RootType_Name: string, schemaData: SchemaDataStore) => {
			if (!rootTypes) {
				rootTypes = get(schemaData).rootTypes
			}

			return rootTypes.filter((type) => {
				return type.name == RootType_Name;
			})[0];
		},
		get_QMS_Field: (name: string, _QMS_: QMSType, schemaData: SchemaDataStore) => {
			//_QMS_ -> choosen QMS (one of: Query,Mutation,Subscription)
			let storeValue = get(schemaData);
			// map 'query' -> 'queryFields'
			const key = `${_QMS_}Fields` as keyof SchemaData;
			// Typescript might complain accessing dynamic key if not fully typed or if key might be undefined
			// Cast to any or check existence
			const list = storeValue[key] as any[];

			const QMSField = list?.filter((field: any) => {
				return field.name == name;
			})[0];
			if (!QMSField) {

				console.info({ QMSField }, name, { storeValue }, get(store), list)
			}
			return QMSField
		}
	};
	return returnObject;
};
