import { writable } from "svelte/store";


export const Create_offsetBasedPaginationState = (initialValue = { limit: 10, offset: 0 }) => {

    const store = writable(initialValue)
    const { subscribe, set, update } = store

    return {
        subscribe, set, update, nextPage: () => {
            update((val) => {
                val.offset = val.offset + val.limit
                return val
            })
        }, prevPage: () => {
            update((val) => {
                val.offset = val.offset - val.limit
                return val
            })
        }, toPage: (page: number) => {
            update((val) => {
                val.offset = val.limit * page
                return val
            })
        }
    }
}
