import { writable } from "svelte/store";

export const Create_introspectionResult = () => {

    const store = writable({ rootTypes: [], queryFields: [], mutationFields: [], schema: {} })
    const { subscribe, set, update } = store

    return {
        subscribe, set, update,
        set_rootFields: (withDerivedData: false, schema) => {

        },
        set_queryFields: (withDerivedData: false, rootFields) => {

        },
        set_mutationFields: (withDerivedData: false, rootFields) => {

        },
        set_subscriptionFields: (withDerivedData: false, rootFields) => {

        },
        set_fields: (withDerivedData: false, schema) => { //set rootFields,queryFields,mutationFields,subscriptionFields //fields or types?

        }

    }
}
export const introspectionResult = Create_introspectionResult()