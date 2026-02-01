/**
 * Utility functions for handling node steps and field steps transformations
 */

/**
 * Converts steps of nodes to steps of fields by filtering and flattening
 * @param stepsOfNodes - Array of node steps, each step is [not, displayName, operator]
 * @returns Flattened array of field steps
 */
export function stepsOfNodesToStepsOfFields(
	stepsOfNodes: Array<[string | undefined, string | undefined, string | undefined]>
): string[] {
	const stepsOfFields = stepsOfNodes
		.filter((step) => {
			const [not, displayName, operator] = step;
			return displayName || operator || not;
		})
		.map((step) => {
			const [not, displayName, operator] = step;
			const stepMod = [];
			if (not) {
				stepMod.push(not);
			}
			if (displayName) {
				stepMod.push(displayName);
			}
			if (operator && (operator != 'bonded' || (operator == 'bonded' && displayName == null))) {
				stepMod.push(operator);
			}
			return stepMod;
		})
		.flat(Infinity) as string[];

	return stepsOfFields;
}

/**
 * Creates updated steps of nodes by appending current node info to parent steps
 * @param stepsOfNodesParent - Parent node's steps
 * @param node - Current node with not, dd_displayName, and operator properties
 * @returns Updated steps of nodes array
 */
export function getUpdatedStepsOfNodes(
	stepsOfNodesParent: Array<[string | undefined, string | undefined, string | undefined]>,
	node: { not?: boolean; dd_displayName?: string; operator?: string }
): Array<[string | undefined, string | undefined, string | undefined]> {
	let stepsOfNodesCopy = JSON.parse(JSON.stringify(stepsOfNodesParent));
	stepsOfNodesCopy.push([node?.not ? '_not' : undefined, node?.dd_displayName, node?.operator]);
	return stepsOfNodesCopy;
}

/**
 * Updates node with computed steps information
 * @param node - Node to update
 * @param stepsOfFieldsFull - Full steps of fields
 * @param stepsOfFields - Filtered steps of fields
 * @param stepsOfNodes - Steps of nodes
 * @param filterElFromArr - Function to filter elements from array
 */
export function updateNodeSteps(
	node: any,
	stepsOfFieldsFull: string[],
	stepsOfFields: string[],
	stepsOfNodes: Array<[string | undefined, string | undefined, string | undefined]>,
	filterElFromArr: (arr: string[], toFilter: string[]) => string[]
): void {
	node.stepsOfFieldsFull = stepsOfFieldsFull;
	node.stepsOfFields = stepsOfFields;
	node.stepsOfFieldsMinimal = filterElFromArr(stepsOfFields, ['_and', '_or', '_not']);
	node.stepsOfNodes = stepsOfNodes;
	node.stepsOfFieldsStringified = JSON.stringify(stepsOfFields);
}
