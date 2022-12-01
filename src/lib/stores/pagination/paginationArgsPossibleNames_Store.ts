import { writable } from "svelte/store";

export const paginationArgsPossibleNames_Store = writable({
    limit: ['limit'],
    offset: ['offset', 'skip'],
    first: ['first', '_size'],
    last: ['last'],
    after: ['after', '_cursor'],
    before: ['before'],
    from: ['from'],
    page: ['page']

})