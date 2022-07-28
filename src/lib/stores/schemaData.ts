import { get_NamesArray, get_KindsArray, sortByName, get_rootName, get_displayName, generate_derivedData } from "$lib/utils/usefulFunctions";
import { get, writable } from "svelte/store";

export const create_schemaData = () => {

    const store = writable({ rootTypes: [], queryFields: [], mutationFields: [], schema: {} })
    const { subscribe, set, update } = store
    let returnObject = {
        subscribe, set, update,
        set_schema: (schema) => {

        },
        set_rootTypes: (withDerivedData: false, set_storeVal = true) => {
            let storeValue = get(store)
            let { rootTypes, queryFields, mutationFields, schema } = storeValue
            let new_rootTypes = sortByName([...schema.types])
            if (withDerivedData) {
                new_rootTypes.forEach(el => {
                    Object.assign(el, generate_derivedData(el, new_rootTypes))
                    el?.args?.forEach(arg => {
                        Object.assign(arg, generate_derivedData(arg, new_rootTypes))
                    });
                    el?.fields?.forEach(field => {
                        Object.assign(field, generate_derivedData(field, new_rootTypes))
                        field?.args?.forEach(arg => {
                            Object.assign(arg, generate_derivedData(arg, new_rootTypes))
                        });
                    });
                    el?.inputFields?.forEach(inputField => {
                        Object.assign(inputField, generate_derivedData(inputField, new_rootTypes))
                    });
                    el?.enumValues?.forEach(enumValue => {
                        Object.assign(enumValue, generate_derivedData(enumValue, new_rootTypes))
                    });
                    if (el?.fields) {
                        el.dd__idFields_byProbability = el.dd_get_idFields_byProbability()
                    }
                });
            }


            if (set_storeVal) {
                storeValue.rootTypes = new_rootTypes
                set(storeValue) //works even without this but donno about reactivity
            }

            return new_rootTypes
        },
        set_rootTypes_DerivedData: () => {

        },
        set_QMSFields: (withDerivedData: false, set_storeVal = true, QMS = ['query', 'mutation', 'subscription']) => {//QMS -> Query,Mutation,Subscription
            let storeValue = get(store)
            let { rootTypes, queryFields, mutationFields, schema } = storeValue
            let result = {}
            let isQMSField = true
            QMS.forEach(_QMS_ => {// _QMS_ -> current QMS (one of: Query,Mutation,Subscription)
                let _QMS_Type_name = schema?.[`${_QMS_}Type`]?.name
                let new_QMS_Fields
                if (_QMS_Type_name) {
                    new_QMS_Fields = sortByName(rootTypes?.find((type) => {
                        return type?.name == _QMS_Type_name;
                    })?.fields)
                }

                if (withDerivedData) {
                    new_QMS_Fields?.forEach(el => {
                        Object.assign(el, generate_derivedData(el, rootTypes, isQMSField))
                        el?.args?.forEach(arg => {
                            Object.assign(arg, generate_derivedData(arg, rootTypes))
                        });
                        el?.fields?.forEach(field => {
                            Object.assign(field, generate_derivedData(field, rootTypes))
                            field?.args?.forEach(arg => {
                                Object.assign(arg, generate_derivedData(arg, rootTypes))
                            });
                        });
                        el?.inputFields?.forEach(inputField => {
                            Object.assign(inputField, generate_derivedData(inputField, rootTypes))
                        });
                        el?.enumValues?.forEach(enumValue => {
                            Object.assign(enumValue, generate_derivedData(enumValue, rootTypes))
                        });

                        if (el?.fields) {
                            el.dd_idFields_byProbability = el.dd_get_idFields_byProbability()
                        }
                    });
                }


                if (set_storeVal) {
                    storeValue = { ...storeValue, ...result }
                    set(storeValue) //works even without this but donno about reactivity
                }
                result[`${_QMS_}Fields`] = new_QMS_Fields

            });
            return result
        },
        set_fields: (withDerivedData: false) => { //set rootTypes,queryFields,mutationFields,subscriptionFields //fields or types?
            let rootTypes = returnObject.set_rootTypes(true, true)
            let storeValue = get(store)
            let QMSFields = returnObject.set_QMSFields(true, false, ['query', 'mutation', 'subscription'])
            //console.log('QMSFields', QMSFields)
            set({
                ...storeValue,
                rootTypes,
                ...QMSFields
            })
            storeValue = get(store)
            console.log('storeValue', storeValue)
        },
        get_rootType: (name) => {
            let storeValue = get(store)
            let { rootTypes, queryFields, mutationFields, schema } = storeValue
            return rootTypes.filter((type) => {
                type.name == name
            })[0]
        },
        get_QMS_Field: (name, _QMS_) => { //_QMS_ -> choosen QMS (one of: Query,Mutation,Subscription)
            let storeValue = get(store)
            let { rootTypes, queryFields, mutationFields, schema } = storeValue
            return storeValue?.[`${_QMS_
                }Fields`]?.filter((field) => {
                    return field.name == name
                })[0]

        }
    }
    return returnObject
}
export const schemaData = create_schemaData()