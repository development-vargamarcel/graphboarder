import { writable } from "svelte/store";

export const Create_tableColsData_Store = () => {

    const store = writable([])
    const { subscribe, set, update } = store

    return {
        subscribe, set, update
        , addColumn: (newCollData) => {
            update((storeData) => {
                return [...storeData, newCollData]
            })
        },
        removeColumn: (colToRemoveData_title) => {
            update((storeData) => {
                return storeData.filter((colData) => {
                    return colData.title !== colToRemoveData_title
                });

            })
        }



    }
}
