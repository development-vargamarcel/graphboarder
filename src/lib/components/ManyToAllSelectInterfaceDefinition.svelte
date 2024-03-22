<script>
	import { getContext } from 'svelte';
	import ManyToAllSelectInterfaceDefinitionItem from './ManyToAllSelectInterfaceDefinitionItem.svelte';
	import { getDeepField, getRootType } from '$lib/utils/usefulFunctions';
	export let nodes;
	export let parentNodeId;
	export let parentNode = nodes[parentNodeId];
	export let node;
	export let availableOperators;
	export let group;
	export let type;
	export let originalNodes;
	export let prefix = '';
	export let addDefaultFields;
	export let showSelectQMSModal = false;
	export let rowSelectionState = {};
	export let selectedQMS;
	export let selectedRowsColValues = [];

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
