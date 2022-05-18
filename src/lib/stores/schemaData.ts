import { sortByName } from "$lib/utils/usefulFunctions";
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
            QMS.forEach(_QMS_ => {// _QMS_ -> current QMS (one of: Query,Mutation,Subscription)
                let _QMS_Type_name = schema?.[`${_QMS_}Type`]?.name
                let new_QMS_Fields
                if (_QMS_Type_name) {
                    new_QMS_Fields = sortByName(rootTypes?.find((type) => {
                        return type?.name == _QMS_Type_name;
                    })?.fields)
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
            let rootTypes = returnObject.set_rootTypes(false, true)
            let storeValue = get(store)
            let QMSFields = returnObject.set_QMSFields(false, false, ['query', 'mutation', 'subscription'])
            console.log('QMSFields', QMSFields)
            set({
                ...storeValue,
                rootTypes,
                ...QMSFields
            })
        }

    }
    return returnObject
}
export const schemaData = create_schemaData()