import { writable } from "svelte/store";

export const paginationPossibleNames_Store = writable({
    limit: ['limit'],
    offset: ['offset', 'skip'],
    first: ['first'],
    last: ['last'],
    after: ['after'],
    before: ['before'],
    from: ['from'],
    page: ['page']

})