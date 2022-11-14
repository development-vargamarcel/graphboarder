import { writable } from "svelte/store";

export const offsetBasedPagination_Store = writable({
    offsetPossibleNames: ['offset', 'skip'],
    limitPossibleNames: ['limit']

})