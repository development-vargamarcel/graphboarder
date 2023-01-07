import { writable, get } from "svelte/store"

export const endpointInfoDefaultValues = {
    description: 'no description',
    rowsLocationPossibilities: [
        {
            get_Val: (QMS_info) => {
                return []
            }
            ,
            check: (QMS_info) => {
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
            get_Val: function (QMS_info) {
                return this.check(QMS_info)
            },
            check: (QMS_info) => {
                let possibleNames = ['id', `${QMS_info.dd_displayName}_id`, `${QMS_info.dd_displayName}Id`]
                return QMS_info.dd_relatedRoot?.fields?.find((field) => { return possibleNames.includes(field.dd_displayName) || field.dd_rootName == 'ID' })
            }
        }
    ]
}

const store = writable(null)
export const endpointInfo = {
    ...store, smartSet: (newEndpoint) => { store.set({ ...endpointInfoDefaultValues, ...newEndpoint, }) }, get_rowsLocation: function (QMS_info) {
        const storeVal = get(store)
        if (!storeVal?.rowsLocationPossibilities?.length > 0) {
            return []
        }

        let rowsLocationPossibilitiy = storeVal.rowsLocationPossibilities.find((rowsLocationPossibilitiy) => {
            return rowsLocationPossibilitiy.check(QMS_info);
        });
        if (rowsLocationPossibilitiy) {
            return rowsLocationPossibilitiy.get_Val(QMS_info);
        }
        return [];
    }, get_rowCountLocation: function (QMS_info) {
        const storeVal = get(store)
        if (!storeVal || !storeVal?.rowCountLocationPossibilities?.length > 0) {
            return null
        }

        const rowCountLocationPossibility = storeVal.rowCountLocationPossibilities.find((rowCountLocationPossibility) => {
            return rowCountLocationPossibility.check(QMS_info);
        })

        if (rowCountLocationPossibility) {
            return rowCountLocationPossibility.get_Val(QMS_info);
        }
        console.warn('no rowCountLocation found')
        return null
    }, get_idField: (QMS_info) => {
        const storeVal = get(store)
        if (!storeVal || !storeVal?.idFieldPossibilities?.length > 0) {
            return null
        }
        const idFieldPossibility = storeVal.idFieldPossibilities.find((idFieldPossibility) => {
            return idFieldPossibility.check(QMS_info);
        })

        if (idFieldPossibility) {
            return idFieldPossibility.get_Val(QMS_info);
        }
        console.warn('no idField found')

        return null

    }
}

