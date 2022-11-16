import { writable } from "svelte/store";


export const Create_offsetBasedPaginationState = (initialValue = { limit: 10, offset: 0 }) => {

    const store = writable(initialValue)
    const { subscribe, set, update } = store

    return {
        subscribe, set, update
    }
}
