import { writable } from "svelte/store";

export const scalarsAndEnumsDisplayTypes = writable({
    "ENUM": "ENUM",//leave this always
    "INPUT_OBJECT": "INPUT_OBJECT",//leave this always
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