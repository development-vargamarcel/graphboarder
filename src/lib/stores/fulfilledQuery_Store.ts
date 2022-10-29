import { writable } from "svelte/store";

export const Create_fulfilledQuery_Store = () => {

    const store = writable({ isFullfield: true, requestString: '' })
    const { subscribe, set, update } = store

    return {
        subscribe, set, update,
        updateDataSmart: (requestString, isFullfield) => {
            update((prevData) => {
                if (!isFullfield) {
                    prevData.requestString = requestString
                }
                prevData.isFullfield = isFullfield
                return prevData
            })
        }




    }
}
