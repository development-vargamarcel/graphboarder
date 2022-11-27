import { writable } from "svelte/store";

export const paginationPossibleNames_Store = writable({

    limit: ['limit'],
    offset: ['offset', 'skip'],
    first: ['first'],
    last: ['last'],
    after: ['after'],
    before: ['before'],
    from: ['from'],
    limitPossibleNames: ['limit'],
    offsetPossibleNames: ['offset', 'skip'],
    firstPossibleNames: ['first'],
    lastPossibleNames: ['last'],
    afterPossibleNames: ['after'],
    beforePossibleNames: ['before'],
    fromPossibleNames: ['from'],
})