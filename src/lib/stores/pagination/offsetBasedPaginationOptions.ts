import { writable } from "svelte/store";


export const Create_offsetBasedPaginationOptions = (options = { infiniteScroll: true }) => {

    const store = writable(options)
    const { subscribe, set, update } = store

    return {
        subscribe, set, update
    }
}
