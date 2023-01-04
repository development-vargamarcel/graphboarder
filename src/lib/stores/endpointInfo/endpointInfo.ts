import { writable, get } from "svelte/store"

export const example_endpointInfo = {
    url: 'https://vgqkcskomrpikolllkix.nhost.run/v1beta1/relay',
    description: 'edgeBased pagination',
    headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
    pageInfoFieldsLocation: [],
    namings: {
        hasNextPage: "hasNextPage",
        hasPreviousPage: "hasPreviousPage",
        startCursor: "startCursor",//after,nextPage
        endCursor: "endCursor",//before,previousPage
        cursor: 'cursor'
    }
}

const store = writable(null)
export const endpointInfo = {
    ...store, get_rowsLocation: function (QMS_Info) {
        const storeVal = get(store)
        return storeVal.rowsLocationPossibilities.find((rowsLocationPossibilitiy) => {
            return rowsLocationPossibilitiy.checker(QMS_Info);
        }).rowsLocation;
    }
}

