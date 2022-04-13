import { writable } from "svelte/store";

export const Create_introspectionResult = () => {

    const store = writable({ rootTypes: [], queryFields: [], mutationFields: [] })
    const { subscribe, set, update } = store

    return {
        subscribe, set, update
    }
}
export const introspectionResult = Create_introspectionResult()