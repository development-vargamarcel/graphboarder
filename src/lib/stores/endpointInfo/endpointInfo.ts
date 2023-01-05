import { writable, get } from "svelte/store"

export const endpointInfoDefaultValues = {
    description: 'no description',
    rowsLocationPossibilities: [
        {
            get_Val: (QMS_Info) => {
                return []
            }
            ,
            check: (QMS_Info) => {
                return true
            }
        },

    ],
    rowCountLocationPossibilities: [],
    namings: {
        hasNextPage: 'hasNextPage',
        hasPreviousPage: 'hasPreviousPage',
        startCursor: 'previousPage',
        endCursor: 'nextPage',
        cursor: 'cursor'
    }
}

const store = writable(null)
export const endpointInfo = {
    ...store, smartSet: (newEndpoint) => { store.set({ ...endpointInfoDefaultValues, ...newEndpoint, }) }, get_rowsLocation: function (QMS_Info) {
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

