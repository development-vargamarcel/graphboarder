import { derived } from 'svelte/store'
import { paginationTypes } from './paginationTypes'
export const Create_paginationState_derived = (_pagination_state_Store, paginationArgs, paginationType) => {
    return derived([_pagination_state_Store], ([$_pagination_state_Store], set) => {
        if (paginationTypes.find((pagType) => { return pagType.name == paginationType }).pageIsGreaterThenFirst(_pagination_state_Store, paginationArgs)) {
            set($_pagination_state_Store)
        }
    },)
}