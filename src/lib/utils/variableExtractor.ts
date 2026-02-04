import { parse, visit, Kind, type ASTNode, type TypeNode } from 'graphql';
import { Logger } from '$lib/utils/logger';

/**
 * Extracts variable definitions from a GraphQL query and generates a default JSON object.
 *
 * @param query - The GraphQL query string.
 * @returns A generic object with keys matching the variable names and default values based on type.
 */
export function extractVariables(query: string): Record<string, any> {
	const variables: Record<string, any> = {};
	try {
		const ast = parse(query);
		visit(ast, {
			VariableDefinition(node) {
				const name = node.variable.name.value;
				const value = getDefaultValue(node.type);
				variables[name] = value;
			}
		});
	} catch (e) {
		Logger.warn('Failed to extract variables', e);
	}
	return variables;
}

/**
 * Determines a default value for a given GraphQL type node.
 *
 * @param typeNode - The AST node representing the type.
 * @returns A default value (e.g., 0 for Int, "" for String).
 */
function getDefaultValue(typeNode: TypeNode): any {
	if (typeNode.kind === Kind.NON_NULL_TYPE) {
		return getDefaultValue(typeNode.type);
	}
	if (typeNode.kind === Kind.LIST_TYPE) {
		return [];
	}
	if (typeNode.kind === Kind.NAMED_TYPE) {
		switch (typeNode.name.value) {
			case 'Int':
				return 0;
			case 'Float':
				return 0.0;
			case 'String':
				return '';
			case 'Boolean':
				return false;
			case 'ID':
				return '';
			default:
				return null; // Unknown type (Scalar, Enum, Input Object)
		}
	}
	return null;
}
