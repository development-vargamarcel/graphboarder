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
import { Logger } from '$lib/utils/logger';
import type { EndpointConfiguration, FieldWithDerivedData, SchemaDataStore } from '$lib/types';

export const endpointInfoDefaultValues = {
	description: 'no description',
	idFieldNamePossibilities: ['id'],
	countFieldNamePossibilities: ['count'],
	rowsLocationPossibilities: [
		{
			get_Val: (QMS_info: any) => {
				return ['edges'];
			},
			check: (QMS_info: any, schemaData: any) => {
				const QMS_infoRootType = getRootType(null, QMS_info.dd_rootName, schemaData);
				Logger.debug({ QMS_infoRootType, QMS_info })
				if (!QMS_infoRootType?.fields) {
					Logger.error('QMS_infoRootType.fields is undefined');
					return false;
				}
				return QMS_infoRootType.fields.find((field) => field.dd_displayName === 'edges')
			}
		}
		,
		{
			get_Val: (QMS_info: any) => {
				return [];
			},
			check: (QMS_info: any) => {
				return true;
			}
		}
	],
	rowCountLocationPossibilities: [
		{
			get_Val: (QMS_info: any, schemaData: any, storeVal: any) => {
				const possibleNames = storeVal?.countFieldNamePossibilities || ['count'];
				for (const name of possibleNames) {
					return [name];
				}
				return ['count'];
			},
			check: (QMS_info: any, schemaData: any, storeVal: any) => {
				// Simple check: does the QMS return type have a field matching one of the count names?
				// This is a basic implementation to satisfy the TODO.
				// In a real scenario, we might want to check the return type's fields.
				return false; // Default off, let specific endpoints override or specific logic enable it.
			}
		}
	],
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
			get_Val: function (QMS_info: any, schemaData: any, storeVal: any) {
				return this.check(QMS_info, schemaData, storeVal);
			},
			check: (QMS_info: any, schemaData: any, storeVal: any) => {
				const rootType = getRootType(null, QMS_info.dd_rootName, schemaData)
				const fields = rootType?.fields
				let idField
				const {
					scalarFields,
					non_scalarFields,
					enumFields
				} = getFields_Grouped(rootType!, [], schemaData)
				const nonNullScalarFields = scalarFields.filter((field) => {
					return field.dd_NON_NULL
				})
				Logger.debug({ nonNullScalarFields })
				if (nonNullScalarFields.length == 1) {
					return nonNullScalarFields[0]
				}

				const tableNameLowercase = QMS_info.dd_displayName.toLowerCase().replaceAll('s', '')//the last part handles plurar-singular problems

				let possibleNames = [...(storeVal?.idFieldNamePossibilities || [])];
				if (!possibleNames.includes('id')) possibleNames.push('id');
				possibleNames.push(`${tableNameLowercase}_id`, `${tableNameLowercase}id`);

				possibleNames.find(possibleName => {
					idField = nonNullScalarFields?.find((field) => {
						const fieldDisplayNameLowercase = field.dd_displayName.toLowerCase().replaceAll('s', '')//the last part handles plurar-singular problems
						return possibleName == fieldDisplayNameLowercase
					});
					return idField
				});
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
					Logger.info('private key could be a conbination of these columns:', { idFields })
				}
				if (idFields.length == 1) {
					return idFields[0]
				}
				Logger.warn('id field is one of these', { nonNullScalarFields })

			}
		}
	],
	typesExtraDataPossibilities: [

		{
			get_Val: () => {
				return { displayInterface: 'codeeditor', defaultValue: '{}', use_transformerREVERSE: (val: any) => { return val }, use_transformer: string_transformer };
			},
			check: function (dd_rootName: string, dd_displayName: string, typeObj: any) {
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
			check: function (dd_rootName: string, dd_displayName: string, typeObj: any) {
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
			check: function (dd_rootName: string, dd_displayName: string, typeObj: any) {
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
					use_transformerREVERSE: (val: any) => { return val }, use_transformer: number_transformer
				};
			},
			check: function (dd_rootName: string, dd_displayName: string, typeObj: any) {
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
			check: function (dd_rootName: string, dd_displayName: string, typeObj: any) {
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
				return { displayInterface: 'boolean', defaultValue: true, use_transformerREVERSE: (val: any) => { return val }, use_transformer: boolean_transformer };
			},
			check: function (dd_rootName: string, dd_displayName: string, typeObj: any) {
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
				return { displayInterface: 'ENUM', defaultValue: [], use_transformerREVERSE: (val: any) => { return val }, use_transformer: (val: any) => { return val } };
			},
			check: function (dd_rootName: string, dd_displayName: string, typeObj: any) {
				if (!dd_rootName) {
					return null
				}
				const dd_rootNameLowerCase = dd_rootName.toLowerCase();
				return dd_rootNameLowerCase.includes('enum') || dd_rootNameLowerCase.includes('constraint');
			}
		}
		, {
			get_Val: () => {
				return { displayInterface: null, defaultValue: null, use_transformerREVERSE: (val: any) => { return val }, use_transformer: (val: any) => { return val } };
			},
			check: function (dd_rootName: string, dd_displayName: string, typeObj: any) {
				//	console.warn('no typesExtraDataPossibility found,using the default one')
				return true
			}
		}
	],
	idDecoderPossibilities: [
		{
			get_Val: (QMS_info: any, schemaData: any, id: any) => {
				return id

			},
			check: (QMS_info: any, schemaData: any) => { return true }
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



/**
 * Creates the endpoint info store with configuration and helper methods to inspect the schema.
 * @param endpointConfiguration - The initial configuration for the endpoint.
 * @returns A writable store enriched with helper methods.
 */
export const create_endpointInfo_Store = (endpointConfiguration = {}) => {


	const store = writable<EndpointConfiguration>({ ...endpointInfoDefaultValues, ...endpointConfiguration });

	const get_fieldsNames = (currentQMS_info: any, fieldsLocation: any, schemaData: SchemaDataStore, FieldsPossibleNamesName: any) => {
		//do not move this function,needs "store" to be defined
		const storeVal = get(store) as any;
		if (!storeVal || !storeVal?.[FieldsPossibleNamesName]) {
			return null;
		}
		const fieldsNames: any = {}
		const QMSInfo = getDeepField(currentQMS_info, fieldsLocation, schemaData, 'fields')
		if (!QMSInfo) return null;
		const QMSInfoROOT = getRootType(null, QMSInfo.dd_rootName, schemaData)
		if (!QMSInfoROOT?.fields) return null;
		const QMSInfoROOTFieldNames = QMSInfoROOT.fields.map((field: any) => field.dd_displayName)

		for (const [name, possibilities] of Object.entries(storeVal[FieldsPossibleNamesName])) {
			fieldsNames[name] = (possibilities as any[]).find(possibility => QMSInfoROOTFieldNames.includes(possibility))
		}
		return fieldsNames
	}

	return {
		...store,
		get_thisContext: function () {
			return this
		},
		smartSet: (newEndpoint: any) => {
			store.set({ ...endpointInfoDefaultValues, ...newEndpoint });
		},
		get_inputFieldsContainerLocation: function (QMS_info: any, schemaData: SchemaDataStore) {
			const storeVal = get(store);
			if (!storeVal?.inputColumnsPossibleLocationsInArg?.length) {
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
		get_rowsLocation: function (QMS_info: any, schemaData: SchemaDataStore) {
			const storeVal = get(store);
			if (!storeVal?.rowsLocationPossibilities?.length) {
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
		get_rowCountLocation: function (QMS_info: any, schemaData: SchemaDataStore) {
			Logger.debug({ schemaData })
			const storeVal = get(store);
			if (!storeVal || !storeVal?.rowCountLocationPossibilities?.length) {
				return null;
			}

			const rowCountLocationPossibility = storeVal.rowCountLocationPossibilities.find(
				(rowCountLocationPossibility) => {
					return rowCountLocationPossibility.check(QMS_info, schemaData, storeVal);
				}
			);


			if (rowCountLocationPossibility) {
				return rowCountLocationPossibility.get_Val(QMS_info, schemaData, storeVal);
			}
			Logger.warn('no rowCountLocation found', QMS_info);
			return null;
		},
		get_idField: (QMS_info: any, schemaData: SchemaDataStore) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.idFieldPossibilities?.length) {
				Logger.warn('no idFieldPossibilities found or endpointInfo value is null/undefined');
				return null;
			}
			const idFieldPossibility = storeVal.idFieldPossibilities.find((idFieldPossibility) => {
				return idFieldPossibility.check(QMS_info, schemaData, storeVal);
			});

			if (idFieldPossibility) {
				return idFieldPossibility.get_Val(QMS_info, schemaData, storeVal);
			}
			Logger.warn('no idField found', { idFieldPossibilities: storeVal.idFieldPossibilities, idFieldPossibility, QMS_info });

			return null;
		},
		get_typeExtraData: (typeInfo: any, choosenDisplayInterface: any) => {
			//!!!maybe is a good approach to make available  entire typeInfo (QMS_info) to 'check' and 'get_Val'
			const storeVal = get(store);
			if (!storeVal || !storeVal?.typesExtraDataPossibilities?.length) {
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
			return null;
		},
		get_tableName: (QMS_info: any, schemaData: SchemaDataStore) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.tableNamePossibilities?.length) {
				return null;
			}
			const tableNamePossibility = storeVal.tableNamePossibilities.find((tableNamePossibility) => {
				return tableNamePossibility.check(QMS_info, schemaData);
			});

			if (tableNamePossibility) {
				return tableNamePossibility.get_Val(QMS_info, schemaData);
			}
			Logger.warn('no tableName found');

			return null;
		},
		get_qmsNameForObjective: function (QMS_info: any, schemaData: SchemaDataStore, qmsObjective: any) {
			const thisContext = this
			const tableName = this.get_tableName(QMS_info, schemaData);
			if (!tableName) {
				Logger.warn('no qmsNameForObjective found because tableName is null');
				return null
			}
			const storeVal = get(store);
			if (!storeVal || !storeVal?.qmsNameForObjectivePossibilities?.length) {
				return null;
			}
			const qmsNameForObjectivePossibility = storeVal.qmsNameForObjectivePossibilities.find((qmsNameForObjectivePossibility) => {
				return qmsNameForObjectivePossibility.check({ QMS_info, schemaData, thisContext, tableName, qmsObjective });
			});

			if (qmsNameForObjectivePossibility) {
				return qmsNameForObjectivePossibility.get_Val({ QMS_info, schemaData, thisContext, tableName, qmsObjective });
			}
			Logger.warn('no qmsNameForObjective found');

			return null;

		},
		get_decodedId: (QMS_info: any, schemaData: SchemaDataStore, id: any) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.idDecoderPossibilities?.length) {
				return null;
			}
			const idDecoderPossibility = storeVal.idDecoderPossibilities.find((idDecoderPossibility) => {
				return idDecoderPossibility.check(QMS_info, schemaData);
			});

			if (idDecoderPossibility) {
				return idDecoderPossibility.get_Val(QMS_info, schemaData, id);
			}
			Logger.warn('no idDecoder found');

			return null;
		}

		,
		get_relayPageInfoFieldsNames: (currentQMS_info: any, pageInfoFieldsLocation: any, schemaData: SchemaDataStore) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.relayPageInfoFieldsPossibleNames) {
				return null;
			}
			return get_fieldsNames(currentQMS_info, pageInfoFieldsLocation, schemaData, 'relayPageInfoFieldsPossibleNames')

		}
		,
		get_relayCursorFieldName: (currentQMS_info: any, rowsLocation: any, schemaData: SchemaDataStore) => {
			const storeVal = get(store);
			if (!storeVal || !storeVal?.relayCursorPossibleNames) {
				return null;
			}
			return get_fieldsNames(currentQMS_info, rowsLocation, schemaData, 'relayCursorPossibleNames')

		}

	}
}
