<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import ManyToAllSelectInterfaceDefinitionItem from './ManyToAllSelectInterfaceDefinitionItem.svelte';
	import { getDeepField, getRootType } from '$lib/utils/usefulFunctions';
	import { Logger } from '$lib/utils/logger';
	interface Props {
		nodes: any;
		parentNodeId: any;
		parentNode?: any;
		node: any;
		availableOperators: any;
		group: any;
		type: any;
		originalNodes: any;
		prefix?: string;
		addDefaultFields: any;
		showSelectQMSModal?: boolean;
		rowSelectionState?: any;
		selectedQMS: any;
		selectedRowsColValues?: any;
	}

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
	}: Props = $props();

	//
	import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';
	let mainWraperContext = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	const endpointInfo = mainWraperContext?.endpointInfo;
	const schemaData = mainWraperContext?.schemaData;
	//
	const OutermostQMSWraperContext = getContext<QMSWraperContext>(`${untrack(() => prefix)}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	let inputFieldsContainerLocation = $derived(endpointInfo.get_inputFieldsContainerLocation(
		node,
		schemaData
	));
	let inputFieldsContainer = $derived(getDeepField(
		node,
		inputFieldsContainerLocation,
		schemaData,
		'inputFields'
	));
	let inputFieldsContainerRoot = $derived(getRootType(null, inputFieldsContainer.dd_rootName, schemaData));
	let inputFields = $derived(inputFieldsContainerRoot?.inputFields || []);
    $effect(() => {
	    Logger.debug({ inputFieldsContainer, inputFieldsContainerRoot, inputFields });
    });
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
