import { writable } from "svelte/store";
import { paginationTypes } from "./paginationTypes";


export const Create_paginationState = (initialValue, paginationArgs, paginationType) => {
    const paginationTypeInfo = paginationTypes.find((pagType) => {
        return pagType.name == paginationType
    })
    console.log(paginationTypeInfo)
    const store = writable(initialValue ? initialValue : paginationTypeInfo?.get_initialState(paginationArgs))
    const { subscribe, set, update } = store

    return {
        subscribe, set, update, nextPage: (currentResultData) => {
            update((val) => {
                return paginationTypeInfo.get_nextPageState(val, paginationArgs, currentResultData)

            })
        }, prevPage: (currentResultData) => {
            update((val) => {
                return paginationTypeInfo.get_prevPageState(val, paginationArgs, currentResultData)
            })
        }, resetToDefault: () => {
            update((val) => {
                return paginationTypeInfo.get_defaultPaginationStateForDynamic(val, paginationArgs,)

            })
        }
    }
}
