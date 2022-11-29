import { writable } from "svelte/store";
import { paginationTypes } from "./paginationTypes";

const defaultInitialValue = { limit: 20, offset: 0 }
export const Create_offsetBasedPaginationState = (initialValue = JSON.parse(JSON.stringify(defaultInitialValue)), paginationArgs, paginationType) => {
    const paginationTypeInfo = paginationTypes.find((pagType) => {
        return pagType.name == paginationType
    })
    console.log(paginationTypeInfo)
    const store = writable(initialValue)
    const { subscribe, set, update } = store

    return {
        subscribe, set, update, nextPage: () => {
            update((val) => {
                return paginationTypeInfo.get_nextPageState(val, paginationArgs)

            })
        }, prevPage: () => {
            update((val) => {
                return paginationTypeInfo.get_prevPageState(val, paginationArgs)
            })
        }, resetToDefault: () => {
            update((val) => {
                return paginationTypeInfo.get_defaultPaginationStateForDynamic(val, paginationArgs)

            })
        }
    }
}
