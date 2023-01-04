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
        if (!storeVal?.rowsLocationPossibilities?.length > 0) {
            return []
        }

        let rowsLocationPossibilitiy = storeVal.rowsLocationPossibilities.find((rowsLocationPossibilitiy) => {
            return rowsLocationPossibilitiy.check(QMS_Info);
        });
        if (rowsLocationPossibilitiy) {
            return rowsLocationPossibilitiy.get_Val(QMS_Info);
        }
        return [];
    }, get_rowCountLocation: function (QMS_Info) {
        const storeVal = get(store)
        if (!storeVal) {
            return null
        }
        const rowCountLocationPossibility = storeVal.rowCountLocationPossibilities.find((rowCountLocationPossibility) => {
            return rowCountLocationPossibility.check(QMS_Info);
        })

        if (rowCountLocationPossibility) {
            return rowCountLocationPossibility.get_Val(QMS_Info);
        }
        return null
    }
}

