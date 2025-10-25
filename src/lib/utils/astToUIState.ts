import type { DocumentNode, FieldNode, ArgumentNode, ValueNode, SelectionNode, ObjectValueNode } from 'graphql';
import type {
	TableColumnData,
	StepsOfFieldsObject,
	FieldWithDerivedData,
	SchemaData,
	ActiveArgumentGroup,
	ActiveArgumentData,
	EndpointInfoStore,
	ActiveArgumentsDataGroupedStore,
	TableColsDataStore,
	PaginationStateStore
} from '$lib/types';
import { generateArgData } from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
import { getRootType } from '$lib/utils/usefulFunctions';

/**
 * Extract arguments from a GraphQL AST field node
 */
export const extractArgumentsFromAST = (fieldNode: FieldNode): Record<string, unknown> => {
	const args: Record<string, unknown> = {};

	if (!fieldNode.arguments || fieldNode.arguments.length === 0) {
		return args;
	}

	fieldNode.arguments.forEach((arg: ArgumentNode) => {
		const argName = arg.name.value;
		const argValue = extractValueFromAST(arg.value);
		args[argName] = argValue;
	});

	return args;
};

/**
 * Extract value from a GraphQL AST value node
 */
export const extractValueFromAST = (valueNode: ValueNode): unknown => {
	switch (valueNode.kind) {
		case 'IntValue':
			return parseInt(valueNode.value, 10);
		case 'FloatValue':
			return parseFloat(valueNode.value);
		case 'StringValue':
			return valueNode.value;
		case 'BooleanValue':
			return valueNode.value;
		case 'NullValue':
			return null;
		case 'EnumValue':
			return valueNode.value;
		case 'ListValue':
			return valueNode.values.map((v) => extractValueFromAST(v));
		case 'ObjectValue':
			return extractObjectFromAST(valueNode);
		case 'Variable':
			// Variables are not directly supported in this context
			return `$${valueNode.name.value}`;
		default:
			return null;
	}
};

/**
 * Extract object from a GraphQL AST object value node
 */
export const extractObjectFromAST = (objectNode: ObjectValueNode): Record<string, unknown> => {
	const obj: Record<string, unknown> = {};

	objectNode.fields.forEach((field) => {
		const fieldName = field.name.value;
		const fieldValue = extractValueFromAST(field.value);
		obj[fieldName] = fieldValue;
	});

	return obj;
};

/**
 * Extract fields/columns from a GraphQL AST selection set
 */
export const extractFieldsFromAST = (
	selections: readonly SelectionNode[],
	pathPrefix: string[] = []
): TableColumnData[] => {
	const columns: TableColumnData[] = [];

	selections.forEach((selection) => {
		if (selection.kind === 'Field') {
			const fieldName = selection.name.value;
			const currentPath = [...pathPrefix, fieldName];

			// If this field has a selection set, it's a nested field
			if (selection.selectionSet) {
				const nestedColumns = extractFieldsFromAST(
					selection.selectionSet.selections,
					currentPath
				);
				columns.push(...nestedColumns);
			} else {
				// This is a leaf field - create a column for it
				const stepsOfFieldsOBJ = createStepsOfFieldsObject(currentPath);
				columns.push({
					title: currentPath.join('.'),
					stepsOfFields: currentPath,
					stepsOfFieldsOBJ: typeof stepsOfFieldsOBJ === 'string' ? undefined : stepsOfFieldsOBJ
				});
			}
		}
		// Handle InlineFragment and FragmentSpread if needed
	});

	return columns;
};

/**
 * Create a nested object structure from a field path
 * e.g., ['users', 'edges', 'node', 'name'] -> { users: { edges: { node: { name: 'novaluehere' } } } }
 */
export const createStepsOfFieldsObject = (path: string[]): StepsOfFieldsObject | string => {
	if (path.length === 0) {
		return 'novaluehere';
	}

	if (path.length === 1) {
		return { [path[0]]: 'novaluehere' };
	}

	const result: StepsOfFieldsObject = {};
	let current: any = result;

	for (let i = 0; i < path.length; i++) {
		const key = path[i];
		if (i === path.length - 1) {
			// Last element
			current[key] = 'novaluehere';
		} else {
			// Intermediate element
			current[key] = {};
			current = current[key];
		}
	}

	return result;
};

/**
 * Parse a GraphQL query AST and extract UI state
 */
export const parseQueryAST = (ast: DocumentNode): {
	queryName: string | null;
	arguments: Record<string, unknown>;
	fields: TableColumnData[];
} => {
	// Get the first operation definition (query/mutation/subscription)
	const operationDef = ast.definitions.find((def) => def.kind === 'OperationDefinition');

	if (!operationDef || operationDef.kind !== 'OperationDefinition') {
		return {
			queryName: null,
			arguments: {},
			fields: []
		};
	}

	// Get the first field in the selection set (this is typically the query/mutation name)
	const firstSelection = operationDef.selectionSet.selections[0];

	if (!firstSelection || firstSelection.kind !== 'Field') {
		return {
			queryName: null,
			arguments: {},
			fields: []
		};
	}

	const queryName = firstSelection.name.value;
	const args = extractArgumentsFromAST(firstSelection);

	// Extract fields from the selection set
	const fields = firstSelection.selectionSet
		? extractFieldsFromAST(firstSelection.selectionSet.selections, [queryName])
		: [];

	return {
		queryName,
		arguments: args,
		fields
	};
};

/**
 * Separate pagination arguments from other arguments
 */
export const separatePaginationArgs = (
	args: Record<string, unknown>
): {
	paginationArgs: Record<string, unknown>;
	otherArgs: Record<string, unknown>;
} => {
	const paginationArgNames = [
		'limit',
		'offset',
		'first',
		'last',
		'after',
		'before',
		'from',
		'page'
	];

	const paginationArgs: Record<string, unknown> = {};
	const otherArgs: Record<string, unknown> = {};

	Object.entries(args).forEach(([key, value]) => {
		if (paginationArgNames.includes(key)) {
			paginationArgs[key] = value;
		} else {
			otherArgs[key] = value;
		}
	});

	return { paginationArgs, otherArgs };
};

/**
 * Convert AST arguments to ActiveArgumentGroup format
 */
export const argumentsToActiveArgumentGroups = (
	args: Record<string, unknown>,
	qmsInfo: FieldWithDerivedData,
	schemaData: SchemaData,
	endpointInfo: EndpointInfoStore
): void => {
	// This function will be used to populate the activeArgumentsDataGrouped store
	// For now, it focuses on converting the args object to a format the store can handle
	console.log('argumentsToActiveArgumentGroups', { args, qmsInfo });
};

/**
 * Update UI stores based on parsed AST
 */
export const updateStoresFromAST = (
	ast: DocumentNode,
	qmsInfo: FieldWithDerivedData,
	schemaData: SchemaData,
	endpointInfo: EndpointInfoStore,
	activeArgumentsStore: ActiveArgumentsDataGroupedStore,
	tableColsStore: TableColsDataStore,
	paginationStore: PaginationStateStore
): void => {
	const parsed = parseQueryAST(ast);

	console.log('updateStoresFromAST', { parsed, qmsInfo });

	// Update table columns
	if (parsed.fields.length > 0) {
		// Remove the query name from the beginning of each field path
		const cleanedFields = parsed.fields
			.filter((field) => field.stepsOfFields && field.stepsOfFields.length > 1)
			.map((field) => ({
				...field,
				stepsOfFields: field.stepsOfFields!.slice(1),
				title: field.stepsOfFields!.slice(1).join('.')
			}));
		tableColsStore.set(cleanedFields);
	}

	// Separate pagination and other arguments
	const { paginationArgs, otherArgs } = separatePaginationArgs(parsed.arguments);

	// Update pagination state
	if (Object.keys(paginationArgs).length > 0) {
		paginationStore.update((state) => ({
			...state,
			...paginationArgs
		}));
	}

	// Update arguments store
	// We need to call set_groups with the extracted arguments
	if (qmsInfo) {
		activeArgumentsStore.set_groups(qmsInfo, schemaData, otherArgs, endpointInfo);
	}
};
