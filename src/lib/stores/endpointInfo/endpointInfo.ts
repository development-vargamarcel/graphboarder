import {
	boolean_transformer,
	geojson_transformer,
	ISO8601_transformer,
	string_transformer
} from '$lib/utils/dataStructureTransformers';
import { writable, get } from 'svelte/store';

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
	idFieldPossibilities: [
		{
			get_Val: function (QMS_info) {
				return this.check(QMS_info);
			},
			check: (QMS_info) => {
				let possibleNames = ['id', `${QMS_info.dd_displayName}_id`, `${QMS_info.dd_displayName}Id`];
				return QMS_info.dd_relatedRoot?.fields?.find((field) => {
					return possibleNames.includes(field.dd_displayName) || field.dd_rootName == 'ID';
				});
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
				return dd_rootNameLowerCase.includes('stringQQQQQQ') || dd_rootNameLowerCase.includes('textQQQQQQ');
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
					dd_rootNameLowerCase.includes('date') ||
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
				return dd_rootNameLowerCase.includes('int') || dd_rootNameLowerCase.includes('float');
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
				return dd_rootNameLowerCase.includes('enum');
			}
		}, {
			get_Val: () => {
				return { displayInterface: null, defaultValue: null, get_convertedValue: (val) => { return val } };
			},
			check: function (dd_rootName) {
				console.warn('no typesExtraDataPossibility found,using the default one')
				return true
			}
		}
	]
};

const store = writable(null);
export const endpointInfo = {
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
	get_rowCountLocation: function (QMS_info) {
		const storeVal = get(store);
		if (!storeVal || !storeVal?.rowCountLocationPossibilities?.length > 0) {
			return null;
		}

		const rowCountLocationPossibility = storeVal.rowCountLocationPossibilities.find(
			(rowCountLocationPossibility) => {
				return rowCountLocationPossibility.check(QMS_info);
			}
		);

		if (rowCountLocationPossibility) {
			return rowCountLocationPossibility.get_Val(QMS_info);
		}
		console.warn('no rowCountLocation found');
		return null;
	},
	get_idField: (QMS_info) => {
		const storeVal = get(store);
		if (!storeVal || !storeVal?.idFieldPossibilities?.length > 0) {
			return null;
		}
		const idFieldPossibility = storeVal.idFieldPossibilities.find((idFieldPossibility) => {
			return idFieldPossibility.check(QMS_info);
		});

		if (idFieldPossibility) {
			return idFieldPossibility.get_Val(QMS_info);
		}
		console.warn('no idField found');

		return null;
	},
	get_typeExtraData: (typeInfo) => {
		const storeVal = get(store);
		if (!storeVal || !storeVal?.typesExtraDataPossibilities?.length > 0) {
			return null;
		}
		let typesExtraDataPossibility = storeVal.typesExtraDataPossibilities.find(
			(typesExtraDataPossibility) => {
				return (
					typesExtraDataPossibility.check(typeInfo.dd_rootName) ||
					typesExtraDataPossibility.check(typeInfo.dd_kindEl)
				);
			}
		);
		if (typesExtraDataPossibility) {
			return typesExtraDataPossibility.get_Val(typeInfo);
		}
		//console.warn('no typeExtraData found');
		return null;
	}
};
