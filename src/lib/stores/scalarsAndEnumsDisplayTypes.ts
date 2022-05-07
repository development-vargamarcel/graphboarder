import { writable } from "svelte/store";

export const scalarsAndEnumsDisplayTypes = writable({
    "Boolean": "Boolean",
    'ID': 'text',
    'String': 'text',
    'Int': 'number',
    'Float': 'number',
    'GraphQLGeoJSON': 'geo',
    'Date': 'date',
    "ENUM": 'none'
})