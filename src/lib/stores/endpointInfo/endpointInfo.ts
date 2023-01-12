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
    ], typesExtraDataPossibilities: [{
        get_Val: () => {
            return { displayType: 'text', get_convertedValue: string_transformer }
        },
        check: function (dd_rootName) {
            const dd_rootNameLowerCase = dd_rootName.toLowerCase()
            return dd_rootNameLowerCase.includes('string') || dd_rootNameLowerCase.includes('text')
        }
    }, {
        get_Val: () => {
            return { displayType: 'datetime-local', get_convertedValue: ISO8601_transformer }
        },
        check: function (dd_rootName) {
            const dd_rootNameLowerCase = dd_rootName.toLowerCase()
            return dd_rootNameLowerCase.includes('timestamp') || dd_rootNameLowerCase.includes('date') || dd_rootNameLowerCase.includes('time')
        }
    },
    {
        get_Val: () => {
            return { displayType: 'number', get_convertedValue: (value) => { return value } }
        },
        check: function (dd_rootName) {
            const dd_rootNameLowerCase = dd_rootName.toLowerCase()
            return dd_rootNameLowerCase.includes('int') || dd_rootNameLowerCase.includes('float')
        }
    }, {
        get_Val: () => {
            return { displayType: 'geo', get_convertedValue: geojson_transformer }
        },
        check: function (dd_rootName) {
            const dd_rootNameLowerCase = dd_rootName.toLowerCase()
            return dd_rootNameLowerCase.includes('geo')
        }
    }, {
        get_Val: () => {
            return { displayType: 'boolean', get_convertedValue: (value) => { return value } }
        },
        check: function (dd_rootName) {
            const dd_rootNameLowerCase = dd_rootName.toLowerCase()
            return dd_rootNameLowerCase.includes('bool')
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

    }, get_typeExtraData: (dd_rootName) => {
        const storeVal = get(store)
        if (!storeVal || !storeVal?.typesExtraDataPossibilities?.length > 0) {
            return null
        }
        const typesExtraDataPossibility = storeVal.typesExtraDataPossibilities.find((typesExtraDataPossibility) => {
            return typesExtraDataPossibility.check(dd_rootName);
        })

        if (typesExtraDataPossibility) {
            return typesExtraDataPossibility.get_Val(dd_rootName);
        }
        console.warn('no typeExtraData found')

        return null
    }
}

