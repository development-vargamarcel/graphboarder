import { writable } from "svelte/store";

export const scalarsAndEnumsDisplayTypes = writable({
    "Boolean": "boolean",
    'ID': 'text',
    'String': 'text',
    'Int': 'number',
    'Float': 'number',
    'GraphQLGeoJSON': 'geo',
    'geometry': 'geo',
    'Date': 'date',
    'timestamptz': 'date'
    // "ENUM": 'none'
})