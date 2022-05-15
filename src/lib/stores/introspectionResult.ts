import { writable } from "svelte/store";

export const Create_introspectionResult = () => {

    const store = writable({ rootTypes: [], queryFields: [], mutationFields: [], schema: {} })
    const { subscribe, set, update } = store

    return {
        subscribe, set, update,
        set_rootFields: (withDerivedData: false) => {

        },
        set_queryFields: (withDerivedData: false) => {

        },
        set_mutationFields: (withDerivedData: false) => {

        },
        set_subscriptionFields: (withDerivedData: false) => {

        },

        set_fields: () => { //set rootFields,queryFields,mutationFields,subscriptionFields //fields or types?

        }

    }
}
export const introspectionResult = Create_introspectionResult()