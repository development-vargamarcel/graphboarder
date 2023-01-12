import { geojson_transformer, ISO8601_transformer, string_transformer } from "$lib/utils/dataStructureTransformers"
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
    ], typesExtraData: [{
        get_Val: (dd_displayName) => {
            return { displayType: 'text', get_convertedValue: string_transformer }
        },
        check: function (dd_displayName) {
            const dd_displayNameLowerCase = dd_displayName.toLowerCase()
            return dd_displayNameLowerCase.includes('string') || dd_displayNameLowerCase.includes('text')
        }
    }, {
        get_Val: (dd_displayName) => {
            return { displayType: 'datetime-local', get_convertedValue: ISO8601_transformer }
        },
        check: function (dd_displayName) {
            const dd_displayNameLowerCase = dd_displayName.toLowerCase()
            return dd_displayNameLowerCase.includes('timestamp') || dd_displayNameLowerCase.includes('date') || dd_displayNameLowerCase.includes('time')
        }
    },
    {
        get_Val: (dd_displayName) => {
            return { displayType: 'number', get_convertedValue: (value) => { return value } }
        },
        check: function (dd_displayName) {
            const dd_displayNameLowerCase = dd_displayName.toLowerCase()
            return dd_displayNameLowerCase.includes('int') || dd_displayNameLowerCase.includes('float')
        }
    }, {
        get_Val: (dd_displayName) => {
            return { displayType: 'geo', get_convertedValue: geojson_transformer }
        },
        check: function (dd_displayName) {
            const dd_displayNameLowerCase = dd_displayName.toLowerCase()
            return dd_displayNameLowerCase.includes('geo')
        }
    }, {
        get_Val: (dd_displayName) => {
            return { displayType: 'boolean', get_convertedValue: (value) => { return value } }
        },
        check: function (dd_displayName) {
            const dd_displayNameLowerCase = dd_displayName.toLowerCase()
            return dd_displayNameLowerCase.includes('bool')
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

