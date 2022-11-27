import { derived } from 'svelte/store'
export const Create_ofsetBasedPaginationState_derived = (_pagination_state_Store) => {
    return derived([_pagination_state_Store], ([$_pagination_state_Store], set) => {
        if ($_pagination_state_Store?.offset > 0 || $_pagination_state_Store?.after || $_pagination_state_Store?.before) {
            set($_pagination_state_Store)
        }
    },)
}