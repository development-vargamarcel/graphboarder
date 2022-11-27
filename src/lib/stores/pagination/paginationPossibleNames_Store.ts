import { writable } from "svelte/store";

export const paginationPossibleNames_Store = writable({
    limitPossibleNames: ['limit'],
    offsetPossibleNames: ['offset', 'skip'],
    firstPossibleNames: ['first'],
    lastPossibleNames: ['last'],
    afterPossibleNames: ['after'],
    beforePossibleNames: ['before'],
    fromPossibleNames: ['from']
})