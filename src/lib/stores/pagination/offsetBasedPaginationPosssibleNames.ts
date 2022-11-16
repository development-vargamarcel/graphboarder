import { writable } from "svelte/store";

export const offsetBasedPaginationPossibleNames_Store = writable({
    offsetPossibleNames: ['offset', 'skip'],
    limitPossibleNames: ['limit']

})