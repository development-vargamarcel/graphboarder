<script>
	import { getContext } from 'svelte';
	import ManyToAllSelectInterfaceDefinitionItem from './ManyToAllSelectInterfaceDefinitionItem.svelte';
	import { getDeepField, getRootType } from '$lib/utils/usefulFunctions';
	/**
	 * @typedef {Object} Props
	 * @property {any} nodes
	 * @property {any} parentNodeId
	 * @property {any} [parentNode]
	 * @property {any} node
	 * @property {any} availableOperators
	 * @property {any} group
	 * @property {any} type
	 * @property {any} originalNodes
	 * @property {string} [prefix]
	 * @property {any} addDefaultFields
	 * @property {boolean} [showSelectQMSModal]
	 * @property {any} [rowSelectionState]
	 * @property {any} selectedQMS
	 * @property {any} [selectedRowsColValues]
	 */

	/** @type {Props} */
	let {
		nodes,
		parentNodeId,
		parentNode = nodes[parentNodeId],
		node,
		availableOperators,
		group,
		type,
		originalNodes,
		prefix = '',
		addDefaultFields,
		showSelectQMSModal = false,
		rowSelectionState = {},
		selectedQMS,
		selectedRowsColValues = []
	} = $props();

	//
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	//
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	const inputFieldsContainerLocation = endpointInfo.get_inputFieldsContainerLocation(
		node,
		schemaData
	);
	const inputFieldsContainer = getDeepField(
		node,
		inputFieldsContainerLocation,
		schemaData,
		'inputFields'
	);
	const inputFieldsContainerRoot = getRootType(null, inputFieldsContainer.dd_rootName, schemaData);
	const inputFields = inputFieldsContainerRoot?.inputFields || [];
	console.log({ inputFieldsContainer, inputFieldsContainerRoot, inputFields });
</script>

<div class="flex space-x-2">
	<!-- {inputFieldsContainer?.dd_kindList ? '(LIST) ' : '(OBJECT) '} -->
	{#each inputFields as field}
		<ManyToAllSelectInterfaceDefinitionItem
			{field}
			{nodes}
			{parentNodeId}
			{parentNode}
			{node}
			{availableOperators}
			{group}
			{type}
			{originalNodes}
			{prefix}
			{addDefaultFields}
			{showSelectQMSModal}
			{rowSelectionState}
			{selectedQMS}
			{selectedRowsColValues}
		/>
	{/each}
</div>
