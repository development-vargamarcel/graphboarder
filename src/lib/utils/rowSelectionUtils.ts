/**
 * Utility functions for handling row selection state
 */

/**
 * Converts a selected rows model to a row selection state object
 * @param selectedRowsModel - Model containing selected rows
 * @returns Object mapping row IDs to true for selected rows
 */
export function getRowSelectionState(selectedRowsModel: {
	rows?: Array<{ id: string }>;
}): Record<string, boolean> {
	let rowSelectionState: Record<string, boolean> = {};

	if (!selectedRowsModel?.rows) {
		return rowSelectionState;
	}

	selectedRowsModel.rows.forEach((row) => {
		rowSelectionState[row.id] = true;
	});

	return rowSelectionState;
}

/**
 * Processes selected rows to extract column values with transformations
 * @param selectedRowsColValues - Array of selected row data
 * @param idColName - Name of the ID column
 * @param requiredColNames - Array of required column names
 * @param node - Node configuration object
 * @param endpointInfo - Endpoint info for ID decoding
 * @param passAllObjectValuesThroughStringTransformerAndReturnNewObject - Transform function
 * @returns Processed array of row data with required columns only
 */
export function processSelectedRowsColValues(
	selectedRowsColValues: any[],
	idColName: string,
	requiredColNames: string[],
	node: {
		dd_kindEl?: string;
		dd_displayName?: string;
		inputFields?: Array<{ dd_NON_NULL?: boolean; dd_displayName?: string }>;
	},
	endpointInfo: any,
	passAllObjectValuesThroughStringTransformerAndReturnNewObject: (obj: any) => any
): any[] {
	return selectedRowsColValues?.map((row) => {
		let idRaw = row[idColName];
		let idDecoded = endpointInfo.get_decodedId(null, null, idRaw);

		if (node.dd_kindEl == 'SCALAR') {
			return { [node.dd_displayName]: idDecoded };
		}

		const rowWithRequiredColsOnly: Record<string, any> = {};
		requiredColNames?.forEach((name) => (rowWithRequiredColsOnly[name] = row[name]));

		return passAllObjectValuesThroughStringTransformerAndReturnNewObject({
			...rowWithRequiredColsOnly,
			[idColName]: idDecoded
		});
	});
}

/**
 * Extracts required column names from a node's input fields
 * @param node - Node with inputFields array
 * @returns Array of required column names
 */
export function getRequiredColumnNames(node: {
	dd_kindEl?: string;
	inputFields?: Array<{ dd_NON_NULL?: boolean; dd_displayName?: string }>;
}): string[] {
	if (node.dd_kindEl == 'SCALAR') {
		return [];
	}

	return (
		node?.inputFields?.filter((field) => field.dd_NON_NULL).map((field) => field.dd_displayName) ||
		[]
	);
}
