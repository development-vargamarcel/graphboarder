import { writable } from "svelte/store";


export const Create_isDragging_Store = () => {

    const store = writable(false)
    const { subscribe, set, update } = store

    return {
        subscribe, set, update
    }
}
