import { writable } from "svelte/store";

export const displayStucture = writable({
    "timestamptz": "ISO8601",
    'date_filter_operators': 'ISO8601',
    'bigint_comparison_exp': 'number',
    'geometry_comparison_exp': 'geo',
})