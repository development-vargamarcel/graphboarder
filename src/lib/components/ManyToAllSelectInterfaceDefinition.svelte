<script>
	import ManyToAllSelectInterfaceDefinitionItem from './ManyToAllSelectInterfaceDefinitionItem.svelte';
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
	export let showSelectModal = false;
	export let rowSelectionState = {};
	export let selectedQMS;
	export let selectedRowsColValues = [];
	const inputFields = node.inputFields || [];
</script>

<div class="flex space-x-2">
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
			{showSelectModal}
			{rowSelectionState}
			{selectedQMS}
			{selectedRowsColValues}
		/>
	{/each}
</div>
