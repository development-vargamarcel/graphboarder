import { writable } from "svelte/store";

export const filterOperatorsDefaultdisplayInterface = writable({
    "String_comparison_exp": "text",
    'Int_comparison_exp': 'number',
    'timestamptz_comparison_exp': 'datetime-local',
    'bigint_comparison_exp': 'number',
    'geometry_comparison_exp': 'geo',
    'date_filter_operators': 'datetime-local',
})