import {
	boolean_transformer,
	geojson_transformer,
	ISO8601_transformer,
	string_transformer,
	number_transformer,
	string_transformerREVERSE,
	geojson_transformerREVERSE,
	ISO8601_transformerREVERSE,
	ISO8601_transformerGETDEFAULTVAl
} from '$lib/utils/dataStructureTransformers';
import { writable, get } from 'svelte/store';
import { getDeepField, getFields_Grouped, getRootType } from '$lib/utils/usefulFunctions';
export const endpointInfoDefaultValues = {
	description: 'no description',
	rowsLocationPossibilities: [
		{
			get_Val: (QMS_info) => {
				return ['edges'];
			},
			check: (QMS_info, schemaData) => {
				const QMS_infoRootType = getRootType(null, QMS_info.dd_rootName, schemaData);
				console.log({ QMS_infoRootType, QMS_info })
				if (!QMS_infoRootType?.fields) {
					console.error('QMS_infoRootType.fields is undefined');
					return false;
				}
				return QMS_infoRootType.fields.find((field) => field.dd_displayName === 'edges')
			}
		}
		,
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
	relayPageInfoFieldsPossibleNames: {
		hasNextPage: ['hasNextPage'],
		hasPreviousPage: ['hasPreviousPage'],
		startCursor: ['previousPage', 'startCursor'],
		endCursor: ['nextPage', 'endCursor'],
		cursor: ['cursor']
	},
	relayCursorPossibleNames: {
		cursor: ['cursor']
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
				console.log({ nonNullScalarFields })
				if (nonNullScalarFields.length == 1) {
					return nonNullScalarFields[0]
				}

				const tableNameLowercase = QMS_info.dd_displayName.toLowerCase().replaceAll('s', '')//the last part handles plurar-singular problems

				let possibleNames = ['id', `${tableNameLowercase}_id`, `${tableNameLowercase}id`];
				possibleNames.find(possibleName => {
					idField = nonNullScalarFields?.find((field) => {
						const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase().replaceAll('s', '')//the last part handles plurar-singular problems
						return possibleName == fieldDisplayNameLowercase
					});
					return idField
				});
				//console.log({ nonNullScalarFields, idField })
				if (idField) {
					return idField
				}
				idField = nonNullScalarFields?.find((field) => {
					const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase().replaceAll('s', '')//the last part handles plurar-singular problems
					return possibleNames.includes(fieldDisplayNameLowercase) || field.dd_rootName == 'ID'
				});
				if (idField) {
					return idField
				}

				idField = nonNullScalarFields?.find((field) => {
					const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase().replaceAll('s', '')//the last part handles plurar-singular problems
					return tableNameLowercase.includes(fieldDisplayNameLowercase);
				});
				if (idField) {
					return idField
				}
				idField = nonNullScalarFields?.find((field) => {
					const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase().replaceAll('s', '')//the last part handles plurar-singular problems
					return fieldDisplayNameLowercase.includes(tableNameLowercase);
				});
				if (idField) {
					return idField
				}

				let idFields = nonNullScalarFields?.filter((field) => {
					const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase().replaceAll('s', '')//the last part handles plurar-singular problems
					return fieldDisplayNameLowercase.includes('id');
				});
				if (idFields.length > 1) {
					console.info('private key could be a conbination of these columns:', { idFields })
				}
				if (idFields.length == 1) {
					return idFields[0]
				}
				console.warn('id field is one of these', { nonNullScalarFields })

			}
		}
	],
	typesExtraDataPossibilities: [

		{
			get_Val: () => {
				return { displayInterface: 'codeeditor', defaultValue: '{}', use_transformerREVERSE: (val) => { return val }, use_transformer: string_transformer };
			},
			check: function (dd_rootName, dd_displayName, typeObj) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				const dd_displayNameLowerCase = dd_displayName.toLowerCase();
				return dd_displayNameLowerCase.includes('config')
			}
		},
		{
			get_Val: () => {
				return { displayInterface: 'text', defaultValue: ' ', use_transformerREVERSE: string_transformerREVERSE, use_transformer: string_transformer };
			},
			check: function (dd_rootName, dd_displayName, typeObj) {
				if (!dd_rootName) {
					return null
				}
				if (typeObj.dd_kindEl?.toLowerCase() == 'enum') {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('string') || dd_rootNameLowerCase.includes('text');
			}
		},
		{
			get_Val: () => {
				return { displayInterface: 'datetime-local', defaultValue: ISO8601_transformerGETDEFAULTVAl(), use_transformerREVERSE: ISO8601_transformerREVERSE, use_transformer: ISO8601_transformer };
			},
			check: function (dd_rootName, dd_displayName, typeObj) {
				if (!dd_rootName) {
					return null
				}
				if (typeObj.dd_kindEl?.toLowerCase() == 'enum') {
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
					displayInterface: 'number', defaultValue: 0,
					use_transformerREVERSE: (val) => { return val }, use_transformer: number_transformer
				};
			},
			check: function (dd_rootName, dd_displayName, typeObj) {
				if (!dd_rootName) {
					return null
				}
				if (typeObj.dd_kindEl?.toLowerCase() == 'enum') {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.replace('constraint', '').includes('int') || dd_rootNameLowerCase.includes('float');
			}
		},
		{
			get_Val: () => {
				return { displayInterface: 'geo', defaultValue: undefined, use_transformerREVERSE: geojson_transformerREVERSE, use_transformer: geojson_transformer };
			},
			check: function (dd_rootName, dd_displayName, typeObj) {
				if (!dd_rootName) {
					return null
				}
				if (typeObj.dd_kindEl?.toLowerCase() == 'enum') {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('geo');
			}
		},
		{
			get_Val: () => {
				return { displayInterface: 'boolean', defaultValue: true, use_transformerREVERSE: (val) => { return val }, use_transformer: boolean_transformer };
			},
			check: function (dd_rootName, dd_displayName, typeObj) {
				if (!dd_rootName) {
					return null
				}
				if (typeObj.dd_kindEl?.toLowerCase() == 'enum') {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('bool');
			}
		}, {
			get_Val: () => {
				return { displayInterface: 'ENUM', defaultValue: [], use_transformerREVERSE: (val) => { return val }, use_transformer: (val) => { return val } };
			},
			check: function (dd_rootName, dd_displayName, typeObj) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('enum') || dd_rootNameLowerCase.includes('constraint');
			}
		}
		, {
			get_Val: () => {
				return { displayInterface: null, defaultValue: null, use_transformerREVERSE: (val) => { return val }, use_transformer: (val) => { return val } };
			},
			check: function (dd_rootName, dd_displayName, typeObj) {
				//	console.warn('no typesExtraDataPossibility found,using the default one')
				return true
			}
		}
	],
	idDecoderPossibilities: [
		{
			get_Val: (QMS_info, schemaData, id) => {
				return id

			},
			check: (QMS_info, schemaData) => { return true }
		},
	],
	returningColumnsPossibleLocationsInMutations: [[]
	],
	returningColumnsPossibleLocationsInQueriesPerRow: [
		['node'], []
	],
	inputColumnsPossibleLocationsInArg: [
		[]
	]
	, pageInfoFieldsLocation: ['pageInfo'],

};




export const create_endpointInfo_Store = (endpointConfiguration = {}) => {


	const store = writable({ ...endpointInfoDefaultValues, ...endpointConfiguration });

	const get_fieldsNames = (currentQMS_info, fieldsLocation, schemaData, FieldsPossibleNamesName) => {
		//do not move this function,needs "store" to be defined
		const storeVal = get(store);
		if (!storeVal || !storeVal?.[FieldsPossibleNamesName]) {
			return null;
		}
		const fieldsNames = {}
		const QMSInfo = getDeepField(currentQMS_info, fieldsLocation, schemaData, 'fields')
		const QMSInfoROOT = getRootType(null, QMSInfo.dd_rootName, schemaData)
		const QMSInfoROOTFieldNames = QMSInfoROOT.fields.map(field => field.dd_displayName)

		for (const [name, possibilities] of Object.entries(storeVal[FieldsPossibleNamesName])) {
			fieldsNames[name] = possibilities.find(possibility => QMSInfoROOTFieldNames.includes(possibility))
		}
		return fieldsNames
	}

	return {
		...store,
		get_thisContext: function () {
			return this
		},
		smartSet: (newEndpoint) => {
			store.set({ ...endpointInfoDefaultValues, ...newEndpoint });
		},
		get_inputFieldsContainerLocation: function (QMS_info, schemaData) {
			const storeVal = get(store);
			if (!storeVal?.inputColumnsPossibleLocationsInArg?.length > 0) {
				return [];
			}

			let inputColumnsLocationInArg = storeVal.inputColumnsPossibleLocationsInArg.find(
				(currPossibility) => {
					if (currPossibility.length == 0) {
						return true;
					}
					const deepField = getDeepField(
						QMS_info,
						currPossibility,
						schemaData,
						'inputFields'
					);
					if (deepField) {
						return true
					}
				}
			);

			if (inputColumnsLocationInArg) {
				return inputColumnsLocationInArg
			}
			return [];
		},
		get_rowsLocation: function (QMS_info, schemaData) {
			const storeVal = get(store);
			if (!storeVal?.rowsLocationPossibilities?.length > 0) {
				return [];
			}

			let rowsLocationPossibilitiy = storeVal.rowsLocationPossibilities.find(
				(rowsLocationPossibilitiy) => {
					return rowsLocationPossibilitiy.check(QMS_info, schemaData);
				}
			);
			if (rowsLocationPossibilitiy) {
				return rowsLocationPossibilitiy.get_Val(QMS_info, schemaData);
			}
			return [];
		},
		get_rowCountLocation: function (QMS_info, schemaData) {
			console.log({ schemaData })
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
				console.warn('no idFieldPossibilities found or endpointInfo value is null/undefined');
				return null;
			}
			const idFieldPossibility = storeVal.idFieldPossibilities.find((idFieldPossibility) => {
				return idFieldPossibility.check(QMS_info, schemaData);
			});

			if (idFieldPossibility) {
				return idFieldPossibility.get_Val(QMS_info, schemaData);
			}
			console.warn('no idField found', { idFieldPossibilities: storeVal.idFieldPossibilities, idFieldPossibility, QMS_info });

			return null;
		},
		get_typeExtraData: (typeInfo, choosenDisplayInterface) => {
			//!!!maybe is a good approach to make available  entire typeInfo (QMS_info) to 'check' and 'get_Val'
			const storeVal = get(store);
			if (!storeVal || !storeVal?.typesExtraDataPossibilities?.length > 0) {
				return null;
			}
			let typesExtraDataPossibility
			if (choosenDisplayInterface) {
				typesExtraDataPossibility = storeVal.typesExtraDataPossibilities
					.find((possibility) => {
						return possibility.get_Val().displayInterface == choosenDisplayInterface;
					})
			} else {
				typesExtraDataPossibility = storeVal.typesExtraDataPossibilities.find(
					(typesExtraDataPossibility) => {
						return (
							typesExtraDataPossibility.check(typeInfo.dd_kindEl, typeInfo.dd_displayName, typeInfo) ||
							typesExtraDataPossibility.check(typeInfo.dd_rootName, typeInfo.dd_displayName, typeInfo)

						);
					}
				);

			}



			if (typesExtraDataPossibility) {
				return typesExtraDataPossibility.get_Val(typeInfo);
			}
			//console.warn('no typeExtraData found');
			return null;
		},
		get_tableName: (QMS_info, schemaData) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.tableNamePossibilities?.length > 0) {
				return null;
			}
			const tableNamePossibility = storeVal.tableNamePossibilities.find((tableNamePossibility) => {
				return tableNamePossibility.check(QMS_info, schemaData);
			});

			if (tableNamePossibility) {
				return tableNamePossibility.get_Val(QMS_info, schemaData);
			}
			console.warn('no tableName found');

			return null;
		},
		get_qmsNameForObjective: function (QMS_info, schemaData, qmsObjective) {
			const thisContext = this
			const tableName = this.get_tableName(QMS_info, schemaData);
			if (!tableName) {
				console.warn('no qmsNameForObjective found because tableName is null');
				return null
			}
			const storeVal = get(store);
			if (!storeVal || !storeVal?.qmsNameForObjectivePossibilities?.length > 0) {
				return null;
			}
			const qmsNameForObjectivePossibility = storeVal.qmsNameForObjectivePossibilities.find((qmsNameForObjectivePossibility) => {
				return qmsNameForObjectivePossibility.check({ QMS_info, schemaData, thisContext, tableName, qmsObjective });
			});

			if (qmsNameForObjectivePossibility) {
				return qmsNameForObjectivePossibility.get_Val({ QMS_info, schemaData, thisContext, tableName, qmsObjective });
			}
			console.warn('no qmsNameForObjective found');

			return null;

		},
		get_decodedId: (QMS_info, schemaData, id) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.idDecoderPossibilities?.length > 0) {
				return null;
			}
			const idDecoderPossibility = storeVal.idDecoderPossibilities.find((idDecoderPossibility) => {
				return idDecoderPossibility.check(QMS_info, schemaData);
			});

			if (idDecoderPossibility) {
				return idDecoderPossibility.get_Val(QMS_info, schemaData, id);
			}
			console.warn('no idDecoder found');

			return null;
		}

		,
		get_relayPageInfoFieldsNames: (currentQMS_info, pageInfoFieldsLocation, schemaData) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.relayPageInfoFieldsPossibleNames) {
				return null;
			}
			return get_fieldsNames(currentQMS_info, pageInfoFieldsLocation, schemaData, 'relayPageInfoFieldsPossibleNames')

		}
		,
		get_relayCursorFieldName: (currentQMS_info, rowsLocation, schemaData) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.relayCursorPossibleNames) {
				return null;
			}
			return get_fieldsNames(currentQMS_info, rowsLocation, schemaData, 'relayCursorPossibleNames')

		}

	}
}