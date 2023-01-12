import { writable } from "svelte/store";

export const scalarsAndEnumsdisplayInterfaces = writable({
    "ENUM": "ENUM",//leave this always
    "INPUT_OBJECT": "INPUT_OBJECT",//leave this always
    "Boolean": "boolean",
    'ID': 'text',
    'String': 'text',
    'Int': 'number',
    'Float': 'number',
    'GraphQLGeoJSON': 'geo',
    'geometry': 'geo',
    'Date': 'datetime-local',
    'timestamptz': 'datetime-local',
    "String_comparison_exp": "text",
    'timestamptz_comparison_exp': 'datetime-local',

    'Int_comparison_exp': 'number',
    'bigint_comparison_exp': 'number',
    'geometry_comparison_exp': 'geo',
    'date_filter_operators': 'datetime-local',
    // "ENUM": 'none'
})