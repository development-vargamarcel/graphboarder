/**
 * Utility functions for QMS context initialization and configuration
 */

import { getDeepField } from './usefulFunctions';

/**
 * Finds the returning columns location for a QMS
 * @param nodeFieldsQMS_info - Node fields QMS info
 * @param possibleLocations - Array of possible locations to check
 * @param schemaData - Schema data object
 * @param fieldType - Type of field to look for ('fields' or 'inputFields')
 * @returns Object with location array and QMS info, or null if not found
 */
export function findReturningColumnsLocation(
	nodeFieldsQMS_info: any,
	possibleLocations: string[][],
	schemaData: any,
	fieldType: 'fields' | 'inputFields' = 'fields'
): { location: string[]; info: any } | null {
	for (const path of possibleLocations) {
		const info = getDeepField(nodeFieldsQMS_info, path, schemaData, fieldType);
		if (info) {
			return { location: path, info };
		}
	}
	return null;
}

/**
 * Builds the prefix steps of fields for column extraction
 * @param QMSType - Type of QMS ('query' or 'mutation')
 * @param QMS_info_displayName - Display name of the QMS
 * @param rowsLocation - Location of rows in the response
 * @param returningColumnsLocation - Location of returning columns
 * @returns Array of field steps
 */
export function buildPrefixStepsOfFields(
	QMSType: string,
	QMS_info_displayName: string,
	rowsLocation: string[],
	returningColumnsLocation: string[]
): string[] {
	if (QMSType == 'query') {
		return [QMS_info_displayName, ...rowsLocation, ...returningColumnsLocation];
	}
	return [QMS_info_displayName, ...returningColumnsLocation];
}

/**
 * Gets the ID column name from returning columns info
 * @param returningColumnsLocationQMS_Info - Returning columns QMS info
 * @param QMS_info - Fallback QMS info
 * @param endpointInfo - Endpoint info object
 * @param schemaData - Schema data object
 * @returns ID column name or undefined
 */
export function getIdColumnName(
	returningColumnsLocationQMS_Info: any,
	QMS_info: any,
	endpointInfo: any,
	schemaData: any
): string | undefined {
	const targetInfo = returningColumnsLocationQMS_Info || QMS_info;
	return endpointInfo.get_idField(targetInfo, schemaData)?.dd_displayName;
}

/**
 * Determines input columns location for a node
 * @param node - Node to check
 * @param possibleLocations - Array of possible locations
 * @param schemaData - Schema data object
 * @returns Object with location and info, or null
 */
export function findInputColumnsLocation(
	node: any,
	possibleLocations: string[][],
	schemaData: any
): { location: string[]; info: any } | null {
	for (const path of possibleLocations) {
		const info = getDeepField(node, path, schemaData, 'inputFields');
		if (info) {
			return { location: path, info };
		}
	}
	return null;
}

/**
 * Creates pagination type info finder
 * @param dd_paginationType - Pagination type name
 * @param paginationTypes - Array of available pagination types
 * @returns Pagination type info or undefined
 */
export function getPaginationTypeInfo(
	dd_paginationType: string | undefined,
	paginationTypes: any[]
): any | undefined {
	if (!dd_paginationType) {
		return undefined;
	}

	return paginationTypes.find((pagType) => pagType.name == dd_paginationType);
}

/**
 * Merges scalar columns with dependency columns from pagination
 * @param scalarColsData - Array of scalar column data
 * @param tableColsData_StoreInitialValue - Initial table column data
 * @param dependencyColsData - Dependency columns from pagination
 * @returns Merged array of column data
 */
export function mergeColumnData(
	scalarColsData: any[],
	tableColsData_StoreInitialValue: any[],
	dependencyColsData: any[]
): any[] {
	return [...scalarColsData, ...tableColsData_StoreInitialValue, ...dependencyColsData];
}
