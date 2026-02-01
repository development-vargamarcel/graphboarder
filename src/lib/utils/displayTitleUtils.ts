/**
 * Utility functions for generating display titles for nodes and groups
 */

/**
 * Generates a display title for a node based on its properties
 * @param node - Node with dd_displayName, operator, and optional not properties
 * @param getPreciseType - Function to get precise type of a value
 * @returns Formatted display title string
 */
export function generateGroupDisplayTitle(
	node: {
		dd_displayName?: string;
		operator?: string;
		not?: boolean;
	},
	getPreciseType: (value: any) => string
): string {
	let groupDisplayTitle = '';

	if (node.dd_displayName) {
		groupDisplayTitle = `${groupDisplayTitle}${node.dd_displayName}`;
	}

	if (node?.operator != 'bonded') {
		if (groupDisplayTitle.trim() != '') {
			groupDisplayTitle = `${groupDisplayTitle} `;
		}

		if (node?.operator == 'list') {
			groupDisplayTitle = `${groupDisplayTitle} (list)`;
		}
		if (['_and', '_or'].includes(node?.operator)) {
			groupDisplayTitle = `${groupDisplayTitle}${node?.operator} (list)`;
		}
	}

	if (groupDisplayTitle.trim() == '' || getPreciseType(groupDisplayTitle) == 'undefined') {
		if (node?.operator == 'bonded') {
			groupDisplayTitle = '(item)';
		} else if (node?.operator == '~spread~') {
			groupDisplayTitle = '(~spread~)';
		}
	}

	return groupDisplayTitle;
}

/**
 * Determines CSS classes for a node based on its operator and state
 * @param node - Node with operator and not properties
 * @returns Object with text and border color classes
 */
export function getNodeDisplayClasses(node: { operator?: string; not?: boolean }): {
	textClass: string;
	borderClass: string;
	bgClass: string;
} {
	let textClass = 'text-base-content';
	let borderClass = 'border-base-content';
	let bgClass = '';

	if (node?.operator == undefined || node?.operator == 'bonded') {
		textClass = 'text-base-content';
		borderClass = 'border-base-content';
	} else if (node?.operator == '_and') {
		textClass = 'text-primary';
		borderClass = 'border-primary';
	} else if (node?.operator == '_or' || node?.operator == 'list') {
		textClass = 'text-secondary';
		borderClass = 'border-secondary';
	}

	if (node?.not) {
		bgClass = 'bg-gradient-to-r from-secondary/50';
	}

	return { textClass, borderClass, bgClass };
}
