import { writable } from "svelte/store";

export const Create_tableColsData_Store = (_pagination_state_Store) => {

    const store = writable([])
    const { subscribe, set, update } = store

    return {
        subscribe, set, update
        , addColumn: (newCollData) => {
            _pagination_state_Store.resetToDefault()
            update((storeData) => {
                return [...storeData, newCollData]
            })
        },
        removeColumn: (colToRemoveData_title) => {
            _pagination_state_Store.resetToDefault()
            update((storeData) => {
                return storeData.filter((colData) => {
                    return colData.title !== colToRemoveData_title
                });

            })
        }



    }
}
