import { writable } from "svelte/store";

export const Create_urqlClient = () => {

    const store = writable(null)
    const { subscribe, set, update } = store

    return {
        subscribe, set, update
    }
}
export const urqlClient = Create_urqlClient()