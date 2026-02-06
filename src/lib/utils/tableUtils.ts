/**
 * Utility functions for table and column configuration
 */

/**
 * Converts column configuration to TanStack visibility map
 * @param columns - Array of column configurations
 * @returns Object mapping column titles to visibility boolean
 */
export function getColumnVisibility(
	columns: Array<{ title: string; hidden?: boolean }>
): Record<string, boolean> {
	const columnVisibility: Record<string, boolean> = {};

	columns.forEach((col) => {
		columnVisibility[col.title] = col.hidden ? false : true;
	});

	return columnVisibility;
}

/**
 * Creates a row selection setter for TanStack table
 * @param options - Svelte store for table options
 * @param table - TanStack table instance
 * @param dispatch - Event dispatcher function
 * @returns Function to set row selection state
 */
export function createRowSelectionSetter(
	options: any,
	table: any,
	dispatch: (event: string, detail: any) => void
) {
	return (updater: any) => {
		let rowSelectionState: Record<string, boolean>;

		if (updater instanceof Function) {
			rowSelectionState = updater({});
		} else {
			rowSelectionState = updater;
		}

		options.update((old: any) => ({
			...old,
			state: {
				...old.state,
				rowSelection: rowSelectionState
			}
		}));

		const tableValue = typeof table === 'function' ? table() : table;
		const selectedRowModel = tableValue?.getSelectedRowModel?.();

		if (selectedRowModel) {
			dispatch('rowSelectionChange', { ...selectedRowModel, rowSelectionState });
		}

		return rowSelectionState;
	};
}

/**
 * Creates table options object for TanStack table
 * @param data - Table data array
 * @param columns - Column definitions
 * @param rowSelectionState - Initial row selection state
 * @param columnVisibility - Column visibility map
 * @param enableMultiRowSelection - Whether to allow multiple row selection
 * @param enableRowSelection - Whether to enable row selection
 * @param idColName - Optional ID column name for getRowId
 * @returns Table options object
 */
export function createTableOptions(
	data: any[],
	columns: any[],
	rowSelectionState: Record<string, boolean>,
	columnVisibility: Record<string, boolean>,
	enableMultiRowSelection: boolean,
	enableRowSelection: boolean,
	getCoreRowModel: any,
	onRowSelectionChange: (updater: any) => void,
	idColName?: string
): any {
	const options: any = {
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		enableMultiRowSelection,
		enableRowSelection,
		onRowSelectionChange,
		enableHiding: true,
		initialState: { rowSelection: rowSelectionState },
		state: { columnVisibility, rowSelection: rowSelectionState }
	};

	if (idColName) {
		options.getRowId = (row: any) => row?.[idColName];
	}

	return options;
}

/**
 * Checks if a column is required or is an ID column
 * @param columnHeader - Column header name
 * @param idColName - ID column name
 * @param requiredColNames - Array of required column names
 * @returns Object with isIdColumn and isRequired flags
 */
export function getColumnFlags(
	columnHeader: string,
	idColName?: string,
	requiredColNames?: string[]
): { isIdColumn: boolean; isRequired: boolean } {
	return {
		isIdColumn: idColName == columnHeader,
		isRequired: requiredColNames?.includes(columnHeader) || false
	};
}
