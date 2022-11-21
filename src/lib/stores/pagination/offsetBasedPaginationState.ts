import { writable } from "svelte/store";

const defaultInitialValue = { limit: 20, offset: 0 }
export const Create_offsetBasedPaginationState = (initialValue = JSON.parse(JSON.stringify(defaultInitialValue))) => {

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
        }, getPage: (page: 0) => {
            update((val) => {
                val.offset = val.limit * page
                return val
            })
        }, resetToDefault: () => {
            update(() => {
                return JSON.parse(JSON.stringify(defaultInitialValue))
            })
        }
    }
}
