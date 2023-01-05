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
    }, idFieldPossibilities: [
        {
            get_Val: function (QMS_Info) {
                return this.check(QMS_Info)
            },
            check: (QMS_Info) => {
                let possibleNames = ['id', `${QMS_Info.dd_displayName}_id`, `${QMS_Info.dd_displayName}Id`]
                return QMS_Info.dd_relatedRoot?.fields?.find((field) => { return possibleNames.includes(field.dd_displayName) })
            }
        }
    ]
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
        console.warn('no rowCountLocation found')
        return null
    }, get_idField: (QMS_Info) => {
        const storeVal = get(store)
        if (!storeVal) {
            return null
        }
        const idFieldPossibility = storeVal.idFieldPossibilities.find((idFieldPossibility) => {
            return idFieldPossibility.check(QMS_Info);
        })

        if (idFieldPossibility) {
            return idFieldPossibility.get_Val(QMS_Info);
        }
        console.warn('no idField found')

        return null

    }
}

