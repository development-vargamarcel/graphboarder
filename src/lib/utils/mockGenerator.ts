import {
	parse,
	visit,
	type ASTNode,
	Kind,
	type FieldNode,
	type OperationDefinitionNode,
	type SelectionSetNode
} from 'graphql';
import type {
	SchemaData,
	SchemaDataStore,
	RootType,
	FieldWithDerivedData,
	GraphQLType,
	GraphQLField
} from '../types/index';
import { Logger } from './logger';
import { get } from 'svelte/store';

/**
 * Generates mock data for a given GraphQL query and schema.
 * @param query - The GraphQL query string.
 * @param schemaData - The schema data.
 * @returns A JSON object representing the mock response.
 */
export function generateMockData(
	query: string,
	schemaData: SchemaDataStore | SchemaData
): Record<string, any> {
	try {
		const schema = 'subscribe' in schemaData ? get(schemaData) : schemaData;
		const ast = parse(query);
		const operation = ast.definitions.find(
			(def) => def.kind === Kind.OPERATION_DEFINITION
		) as OperationDefinitionNode;

		if (!operation) {
			throw new Error('No operation definition found in query.');
		}

		const operationType = operation.operation; // 'query', 'mutation', 'subscription'
		let rootType: RootType | undefined;

		const rootTypeNameMap: Record<string, string> = {
			query: 'Query',
			mutation: 'Mutation',
			subscription: 'Subscription'
		};

		const targetRootTypeName = rootTypeNameMap[operationType];
		rootType = schema.rootTypes.find((rt) => rt.name === targetRootTypeName);

		if (!rootType) {
			Logger.warn(`Could not find root type for operation ${operationType}`);
			return {};
		}

		return {
			data: generateMockForSelectionSet(operation.selectionSet, rootType, schema)
		};
	} catch (error) {
		Logger.error('Error generating mock data:', error);
		return { errors: [{ message: (error as Error).message }] };
	}
}

function generateMockForSelectionSet(
	selectionSet: SelectionSetNode,
	parentType: RootType | GraphQLField | GraphQLType | any,
	schema: SchemaData
): Record<string, any> {
	const result: Record<string, any> = {};

	for (const selection of selectionSet.selections) {
		if (selection.kind === Kind.FIELD) {
			const fieldNode = selection as FieldNode;
			const fieldName = fieldNode.name.value;
			const alias = fieldNode.alias?.value || fieldName;

			let fieldDef: FieldWithDerivedData | undefined;
			let fields: FieldWithDerivedData[] = [];

			if ('fields' in parentType && Array.isArray(parentType.fields)) {
				fields = parentType.fields;
			} else if (parentType.kind === 'OBJECT' && parentType.type) {
				const typeName = getTypeName(parentType);
				const typeDef = schema.rootTypes.find((t) => t.name === typeName);
				if (typeDef && typeDef.fields) {
					fields = typeDef.fields;
				}
			} else if (parentType.name) {
				const typeDef = schema.rootTypes.find((t) => t.name === parentType.name);
				if (typeDef && typeDef.fields) {
					fields = typeDef.fields;
				}
			}

			fieldDef = fields.find((f) => f.name === fieldName);

			if (!fieldDef) {
				if (fieldName === '__typename') {
					result[alias] = getTypeName(parentType) || 'Unknown';
					continue;
				}
				Logger.warn(`Field ${fieldName} not found in type ${getTypeName(parentType)}`);
				result[alias] = null;
				continue;
			}

			result[alias] = generateMockValue(fieldDef, fieldNode, schema);
		} else if (selection.kind === Kind.INLINE_FRAGMENT) {
			const fragmentSelections = generateMockForSelectionSet(
				selection.selectionSet,
				parentType,
				schema
			);
			Object.assign(result, fragmentSelections);
		}
	}

	return result;
}

function generateMockValue(
	fieldDef: FieldWithDerivedData,
	fieldNode: FieldNode,
	schema: SchemaData
): any {
	const type = fieldDef.type;
	const { isList, underlyingType } = unwrapType(type);

	if (isList) {
		return [
			generateMockSingleValue(underlyingType, fieldNode, schema),
			generateMockSingleValue(underlyingType, fieldNode, schema)
		];
	} else {
		return generateMockSingleValue(underlyingType, fieldNode, schema);
	}
}

function generateMockSingleValue(type: GraphQLType, fieldNode: FieldNode, schema: SchemaData): any {
	if (type.kind === 'SCALAR') {
		return generateScalar(type.name || 'String');
	}

	if (type.kind === 'ENUM') {
		const enumType = schema.rootTypes.find((t) => t.name === type.name && t.kind === 'ENUM');
		if (enumType && enumType.enumValues && enumType.enumValues.length > 0) {
			return enumType.enumValues[0].name;
		}
		return 'ENUM_VALUE';
	}

	if (type.kind === 'OBJECT' || type.kind === 'INTERFACE' || type.kind === 'UNION') {
		if (fieldNode.selectionSet) {
			const typeDef = schema.rootTypes.find((t) => t.name === type.name);
			return generateMockForSelectionSet(fieldNode.selectionSet, typeDef || type, schema);
		}
		return {};
	}

	return null;
}

function generateScalar(typeName: string): any {
	switch (typeName) {
		case 'Int':
			return Math.floor(Math.random() * 100);
		case 'Float':
			return parseFloat((Math.random() * 100).toFixed(2));
		case 'String':
			return 'MockString_' + Math.floor(Math.random() * 1000);
		case 'Boolean':
			return Math.random() > 0.5;
		case 'ID':
			return 'ID_' + Math.floor(Math.random() * 10000);
		default:
			if (typeName.toLowerCase().includes('date')) return new Date().toISOString();
			return 'Scalar_' + typeName;
	}
}

function unwrapType(type: GraphQLType): { isList: boolean; underlyingType: GraphQLType } {
	let isList = false;
	let current = type;

	while (current.kind === 'NON_NULL' || current.kind === 'LIST') {
		if (current.kind === 'LIST') isList = true;
		if (current.ofType) {
			current = current.ofType;
		} else if (current.type) {
			current = current.type;
		} else {
			break;
		}
	}
	return { isList, underlyingType: current };
}

function getTypeName(type: any): string | undefined {
	if (!type) return undefined;
	if (type.name) return type.name;
	if (type.type) return getTypeName(type.type);
	if (type.ofType) return getTypeName(type.ofType);
	return undefined;
}
