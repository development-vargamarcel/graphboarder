/**
 * Utility functions for search and QMS discovery
 */
import Fuse from 'fuse.js';

/**
 * Creates a Fuse.js search instance for QMS fields
 * @param queryFields - Array of query fields to search
 * @param threshold - Search threshold (0-1, default 0.8)
 * @returns Configured Fuse instance
 */
export function createQMSSearchInstance(queryFields: any[], threshold: number = 0.8): Fuse<any> {
	return new Fuse(queryFields, {
		includeScore: false,
		includeMatches: false,
		threshold,
		keys: ['dd_displayName', 'dd_rootName', 'description']
	});
}

/**
 * Recursively finds fields that match a given field in a type hierarchy
 * @param type - Type to search in
 * @param matchingField - Field to match
 * @param schemaData - Schema data object
 * @param depth - Current recursion depth
 * @param maxDepth - Maximum recursion depth
 * @returns Array of matching fields or null
 */
export function getReturningFields(
	type: { dd_rootName?: string },
	matchingField: { dd_displayName?: string },
	schemaData: any,
	depth: number = 0,
	maxDepth: number = 2
): any[] | null {
	if (depth > maxDepth) {
		return null;
	}

	depth++;
	let rootType = schemaData.get_rootType(null, type.dd_rootName, schemaData);
	let fields = rootType?.fields;

	if (!fields) {
		return null;
	}

	const myField = fields.find((field: any) => field.dd_displayName == matchingField.dd_displayName);

	if (myField) {
		return fields;
	}

	let returningFields: any[] | null = null;
	fields.find((field: any) => {
		returningFields = getReturningFields(field, matchingField, schemaData, depth, maxDepth);
		return returningFields;
	});

	return returningFields;
}

/**
 * Discovers QMS queries that match a given node using fuzzy search
 * @param node - Node to find matching QMS for
 * @param group - Group containing origin type info
 * @param schemaData - Schema data object
 * @param fuse - Fuse search instance
 * @returns Array of matching QMS rows
 */
export function discoverMatchingQMS(
	node: { dd_displayName?: string; dd_rootName?: string },
	group: { originType?: any },
	schemaData: any,
	fuse: Fuse<any>
): any[] {
	const originType = group.originType;
	const fields = getReturningFields(originType, node, schemaData);

	const myField = fields?.find((field: any) => field.dd_displayName == node.dd_displayName);

	if (myField) {
		const myFieldRoot = schemaData.get_rootType(null, myField.dd_rootName, schemaData);

		// First try: Exact match by root name and list type
		const exactMatches = schemaData.queryFields.filter((item: any) => {
			return item.dd_kindList && item.dd_rootName == myField.dd_rootName;
		});

		if (exactMatches.length > 0) {
			return exactMatches;
		}

		// Second try: Fuzzy search by root name with list filter
		const fuzzyMatches = fuse
			.search(`${myField.dd_rootName}`)
			.map((item) => item.item)
			.filter((item: any) => item.dd_kindList);

		if (fuzzyMatches.length > 0) {
			return fuzzyMatches;
		}
	}

	// Third try: Fuzzy search by node's root name and display name with list filter
	const nodeSearchTerm = `${node?.dd_rootName?.replaceAll('_', ' ')} | ${node?.dd_displayName?.replaceAll('_', ' ')}`;
	const nodeMatches = fuse
		.search(nodeSearchTerm)
		.map((item) => item.item)
		.filter((item: any) => item.dd_kindList);

	if (nodeMatches.length > 0) {
		return nodeMatches;
	}

	// Fourth try: Same search without list filter
	const allMatches = fuse.search(nodeSearchTerm).map((item) => item.item);

	return allMatches;
}
