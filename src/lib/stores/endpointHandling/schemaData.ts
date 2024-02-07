import {
	get_NamesArray,
	get_KindsArray,
	sortByName,
	get_rootName,
	get_displayName,
	generate_derivedData
} from '$lib/utils/usefulFunctions';
import { get, writable } from 'svelte/store';

export const create_schemaData = () => {
	const store = writable({ rootTypes: [], queryFields: [], mutationFields: [], schema: {}, isReady: false });
	const { subscribe, set, update } = store;
	let returnObject = {
		subscribe,
		set,
		update,
		set_schema: (schema) => { },
		set_rootTypes: (withDerivedData: false, set_storeVal = true, endpointInfo) => {
			let storeValue = get(store);
			let { rootTypes, queryFields, mutationFields, schema } = storeValue;
			let new_rootTypes = sortByName([...schema.types]);
			if (withDerivedData) {
				new_rootTypes.forEach((el) => {
					Object.assign(el, generate_derivedData(el, new_rootTypes, false, endpointInfo));
					el?.args?.forEach((arg) => {
						Object.assign(arg, generate_derivedData(arg, new_rootTypes, false, endpointInfo));
					});
					el?.fields?.forEach((field) => {
						Object.assign(field, generate_derivedData(field, new_rootTypes, false, endpointInfo));
						field?.args?.forEach((arg) => {
							Object.assign(arg, generate_derivedData(arg, new_rootTypes, false, endpointInfo));
						});
					});
					el?.inputFields?.forEach((inputField) => {
						Object.assign(inputField, generate_derivedData(inputField, new_rootTypes, false, endpointInfo));
					});
					el?.enumValues?.forEach((enumValue) => {
						Object.assign(enumValue, generate_derivedData(enumValue, new_rootTypes, false, endpointInfo));
					});

				});
			}

			if (set_storeVal) {
				storeValue.rootTypes = new_rootTypes;
				set(storeValue); //works even without this but donno about reactivity
			}

			return new_rootTypes;
		},
		set_rootTypes_DerivedData: () => { },
		set_QMSFields: (
			withDerivedData: false,
			set_storeVal = true,
			QMS = ['query', 'mutation', 'subscription'], endpointInfo
		) => {
			//QMS -> Query,Mutation,Subscription
			let storeValue = get(store);
			let { rootTypes, queryFields, mutationFields, schema } = storeValue;
			let result = {};
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

				if (withDerivedData) {
					new_QMS_Fields?.forEach((el) => {
						Object.assign(el, generate_derivedData(el, rootTypes, isQMSField, endpointInfo));
						el?.args?.forEach((arg) => {
							Object.assign(arg, generate_derivedData(arg, rootTypes, 'is QMS sub-field', endpointInfo));
						});
						el?.fields?.forEach((field) => {
							Object.assign(field, generate_derivedData(field, rootTypes, 'is QMS sub-field', endpointInfo));
							field?.args?.forEach((arg) => {
								Object.assign(arg, generate_derivedData(arg, rootTypes, 'is QMS sub-field', endpointInfo));
							});
						});
						el?.inputFields?.forEach((inputField) => {
							Object.assign(inputField, generate_derivedData(inputField, 'is QMS sub-field', rootTypes, endpointInfo));
						});
						el?.enumValues?.forEach((enumValue) => {
							Object.assign(enumValue, generate_derivedData(enumValue, 'is QMS sub-field', rootTypes, endpointInfo));
						});


					});
				}

				if (set_storeVal) {
					storeValue = { ...storeValue, ...result };
					set(storeValue); //works even without this but donno about reactivity
				}
				result[`${_QMS_}Fields`] = new_QMS_Fields;
			});
			return result;
		},
		set_fields: (endpointInfo) => {
			//set rootTypes,queryFields,mutationFields,subscriptionFields //fields or types?
			let rootTypes = returnObject.set_rootTypes(true, true, endpointInfo);
			let storeValue = get(store);
			let QMSFields = returnObject.set_QMSFields(true, false, [
				'query',
				'mutation',
				'subscription'
			], endpointInfo);
			set({
				rootTypes,
				...QMSFields, isReady: true
			});
			console.log('updated schemaData', { QMSFields })

		},
		get_rootType: (rootTypes, RootType_Name, schemaData) => {
			if (!rootTypes) {
				rootTypes = get(schemaData).rootTypes
			}

			return rootTypes.filter((type) => {
				return type.name == RootType_Name;
			})[0];
		},
		get_QMS_Field: (name, _QMS_, schemaData) => {
			//_QMS_ -> choosen QMS (one of: Query,Mutation,Subscription)
			let storeValue = get(schemaData);

			const QMSField = storeValue?.[`${_QMS_}Fields`]?.filter((field) => {
				return field.name == name;
			})[0];
			if (!QMSField) {

				console.info({ QMSField }, name, { storeValue }, get(store), storeValue?.[`${_QMS_}Fields`])
			}
			return QMSField
		}
	};
	return returnObject;
};
