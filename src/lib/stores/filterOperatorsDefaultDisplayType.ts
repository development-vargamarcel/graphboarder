import { writable } from "svelte/store";

export const filterOperatorsDefaultDisplayType = writable({
    "String_comparison_exp": "string",
    'Int_comparison_exp': 'number',
    'bigint_comparison_exp': 'number',
    'geometry_comparison_exp': 'geo',
    'date_filter_operators': 'date',
})