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
        set_queryFields: (withDerivedData: false, set_storeVal = true) => {
            let storeValue = get(store)
            let { rootTypes, queryFields, mutationFields, schema } = storeValue
            let queryType_name = schema?.queryType?.name
            let new_queryFields
            if (queryType_name) {
                new_queryFields = sortByName(rootTypes?.find((type) => {
                    return type?.name == queryType_name;
                })?.fields)

                if (set_storeVal) {
                    storeValue.queryFields = new_queryFields
                    set(storeValue) //works even without this but donno about reactivity
                }
            }
            return new_queryFields
        },
        set_mutationFields: (withDerivedData: false, set_storeVal = true) => {
            let storeValue = get(store)
            let { rootTypes, queryFields, mutationFields, schema } = storeValue
            let mutationType_name = schema?.mutationType?.name
            let new_mutationFields
            if (mutationType_name) {
                new_mutationFields = sortByName(rootTypes?.find((type) => {
                    return type?.name == mutationType_name;
                })?.fields)

                if (set_storeVal) {
                    storeValue.mutationFields = new_mutationFields
                    set(storeValue) //works even without this but donno about reactivity
                }
            }
            return new_mutationFields
        },
        set_subscriptionFields: (withDerivedData: false, set_storeVal = true) => {
            let storeValue = get(store)
            let { rootTypes, queryFields, subscriptionFields, schema } = storeValue
            let subscriptionType_name = schema?.subscriptionType?.name
            let new_subscriptionFields
            if (subscriptionType_name) {
                new_subscriptionFields = sortByName(rootTypes?.find((type) => {
                    return type?.name == subscriptionType_name;
                })?.fields)

                if (set_storeVal) {
                    storeValue.subscriptionFields = new_subscriptionFields
                    set(storeValue) //works even without this but donno about reactivity
                }
            }
            return new_subscriptionFields
        },
        set_fields: (withDerivedData: false) => { //set rootTypes,queryFields,mutationFields,subscriptionFields //fields or types?
            let rootTypes = returnObject.set_rootTypes(false, true)
            let queryFields = returnObject.set_queryFields(false, false)
            let mutationFields = returnObject.set_mutationFields(false, false)
            let subscriptionFields = returnObject.set_subscriptionFields(false, false)
            let { schema } = get(store)

            set({
                schema,
                rootTypes,
                queryFields,
                mutationFields,
                subscriptionFields,
            })
        }

    }
    return returnObject
}
export const schemaData = create_schemaData()