import {
	boolean_transformer,
	geojson_transformer,
	ISO8601_transformer,
	string_transformer
} from '$lib/utils/dataStructureTransformers';
import { writable, get } from 'svelte/store';
import { getFields_Grouped, getRootType } from '$lib/utils/usefulFunctions';
export const endpointInfoDefaultValues = {
	description: 'no description',
	rowsLocationPossibilities: [
		{
			get_Val: (QMS_info) => {
				return [];
			},
			check: (QMS_info) => {
				return true;
			}
		}
	],
	rowCountLocationPossibilities: [],
	namings: {
		hasNextPage: 'hasNextPage',
		hasPreviousPage: 'hasPreviousPage',
		startCursor: 'previousPage',
		endCursor: 'nextPage',
		cursor: 'cursor'
	},
	paginationArgsPossibleNames: {
		limit: ['limit'],
		offset: ['offset', 'skip'],
		first: ['first', '_size'],
		last: ['last'],
		after: ['after', '_cursor'],
		before: ['before'],
		from: ['from'],
		page: ['page']
	},
	idFieldPossibilities: [
		{
			get_Val: function (QMS_info, schemaData) {
				return this.check(QMS_info, schemaData);
			},
			check: (QMS_info, schemaData) => {
				const rootType = getRootType(null, QMS_info.dd_rootName, schemaData)
				const fields = rootType?.fields
				let idField
				const {
					scalarFields,
					non_scalarFields,
					enumFields
				} = getFields_Grouped(rootType, [], schemaData)
				const nonNullScalarFields = scalarFields.filter((field) => {
					return field.dd_NON_NULL
				})
				if (nonNullScalarFields.length == 1) {
					return nonNullScalarFields[0]
				}

				const tableNameLowercase = QMS_info.dd_displayName.toLowerCase()
				let possibleNames = ['id', `${tableNameLowercase}_id`, `${tableNameLowercase}id`];
				idField = nonNullScalarFields?.find((field) => {
					const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase()
					return possibleNames.includes(fieldDisplayNameLowercase) || field.dd_rootName == 'ID'
				});
				if (idField) {
					return idField
				}

				idField = nonNullScalarFields?.find((field) => {
					const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase()
					return tableNameLowercase.includes(fieldDisplayNameLowercase);
				});
				if (idField) {
					return idField
				}
				console.warn('id field is one of these', { nonNullScalarFields })

			}
		}
	],
	typesExtraDataPossibilities: [
		{
			get_Val: () => {
				return { displayInterface: 'text', defaultValue: '', get_convertedValue: string_transformer };
			},
			check: function (dd_rootName) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('string') || dd_rootNameLowerCase.includes('text');
			}
		},
		{
			get_Val: () => {
				return { displayInterface: 'datetime-local', get_convertedValue: ISO8601_transformer };
			},
			check: function (dd_rootName) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return (
					dd_rootNameLowerCase.includes('timestamp') ||
					dd_rootNameLowerCase.replace("update", "").includes('date') ||
					dd_rootNameLowerCase.includes('time')
				);
			}
		},
		{
			get_Val: () => {
				return {
					displayInterface: 'number', defaultValue: null,
					get_convertedValue: (value) => {
						return value;
					}
				};
			},
			check: function (dd_rootName) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.replace('constraint', '').includes('int') || dd_rootNameLowerCase.includes('float');
			}
		},
		{
			get_Val: () => {
				return { displayInterface: 'geo', defaultValue: null, get_convertedValue: geojson_transformer };
			},
			check: function (dd_rootName) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('geo');
			}
		},
		{
			get_Val: () => {
				return { displayInterface: 'boolean', defaultValue: true, get_convertedValue: boolean_transformer };
			},
			check: function (dd_rootName) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('bool');
			}
		}, {
			get_Val: () => {
				return { displayInterface: 'ENUM', defaultValue: null, get_convertedValue: (val) => { return val } };
			},
			check: function (dd_rootName) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('enum') || dd_rootNameLowerCase.includes('constraint');
			}
		}, {
			get_Val: () => {
				return { displayInterface: null, defaultValue: null, get_convertedValue: (val) => { return val } };
			},
			check: function (dd_rootName) {
				//	console.warn('no typesExtraDataPossibility found,using the default one')
				return true
			}
		}
	]
};




export const create_endpointInfo_Store = (endpointConfiguration = {}) => {


	const store = writable({ ...endpointInfoDefaultValues, ...endpointConfiguration });



	return {
		...store,
		smartSet: (newEndpoint) => {
			store.set({ ...endpointInfoDefaultValues, ...newEndpoint });
		},
		get_rowsLocation: function (QMS_info) {
			const storeVal = get(store);
			if (!storeVal?.rowsLocationPossibilities?.length > 0) {
				return [];
			}

			let rowsLocationPossibilitiy = storeVal.rowsLocationPossibilities.find(
				(rowsLocationPossibilitiy) => {
					return rowsLocationPossibilitiy.check(QMS_info);
				}
			);
			if (rowsLocationPossibilitiy) {
				return rowsLocationPossibilitiy.get_Val(QMS_info);
			}
			return [];
		},
		get_rowCountLocation: function (QMS_info, schemaData) {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.rowCountLocationPossibilities?.length > 0) {
				return null;
			}

			const rowCountLocationPossibility = storeVal.rowCountLocationPossibilities.find(
				(rowCountLocationPossibility) => {
					return rowCountLocationPossibility.check(QMS_info, schemaData);
				}
			);


			if (rowCountLocationPossibility) {
				return rowCountLocationPossibility.get_Val(QMS_info, schemaData);
			}
			console.warn('no rowCountLocation found', QMS_info);
			return null;
		},
		get_idField: (QMS_info, schemaData) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.idFieldPossibilities?.length > 0) {
				return null;
			}
			const idFieldPossibility = storeVal.idFieldPossibilities.find((idFieldPossibility) => {
				return idFieldPossibility.check(QMS_info, schemaData);
			});

			if (idFieldPossibility) {
				return idFieldPossibility.get_Val(QMS_info, schemaData);
			}
			console.warn('no idField found');

			return null;
		},
		get_typeExtraData: (typeInfo) => {
			//!!!maybe is a good approach to make available  entire typeInfo (QMS_info) to 'check' and 'get_Val'
			const storeVal = get(store);
			if (!storeVal || !storeVal?.typesExtraDataPossibilities?.length > 0) {
				return null;
			}
			let typesExtraDataPossibility = storeVal.typesExtraDataPossibilities.find(
				(typesExtraDataPossibility) => {
					return (
						typesExtraDataPossibility.check(typeInfo.dd_kindEl) ||
						typesExtraDataPossibility.check(typeInfo.dd_rootName)

					);
				}
			);
			if (typesExtraDataPossibility) {
				return typesExtraDataPossibility.get_Val(typeInfo);
			}
			//console.warn('no typeExtraData found');
			return null;
		}
	}
}