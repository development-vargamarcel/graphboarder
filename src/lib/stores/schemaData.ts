import { sortByName } from "$lib/utils/usefulFunctions";
import { get, writable } from "svelte/store";

export const create_schemaData = () => {

    const store = writable({ rootTypes: [], queryFields: [], mutationFields: [], schema: {} })
    const { subscribe, set, update } = store

    return {
        subscribe, set, update,
        set_schema: (schema) => {

        },
        set_rootTypes: (withDerivedData: false, set = true) => {
            let storeValue = get(store)
            let { rootTypes, queryFields, mutationFields, schema } = storeValue
            //handle rootTypes --
            storeValue.rootTypes = sortByName([...schema.types])
            if (set) {
                store.set(storeValue)
            }
            return storeValue.rootTypes
        },
        set_queryFields: (withDerivedData: false, rootTypes) => {
        },
        set_mutationFields: (withDerivedData: false, rootTypes) => {
        },
        set_subscriptionFields: (withDerivedData: false, rootTypes) => {
        },
        set_fields: (withDerivedData: false, schema) => { //set rootTypes,queryFields,mutationFields,subscriptionFields //fields or types?
            update((storeValue) => {
                let { rootTypes, queryFields, mutationFields, schema } = storeValue
                let new_storeValue
            })
        }

    }
}
export const schemaData = create_schemaData()