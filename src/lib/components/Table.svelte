<script lang="ts">
	export let prefix = '';
	import TanTable from './TanTable.svelte';
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	const QMS_info = QMSWraperContext?.QMS_info;
	let idColName = endpointInfo.get_idField(QMS_info, schemaData)?.dd_displayName;
	export let colsData = [];
	export let showCheckBox = false;
	export let rows = [];
	export let infiniteHandler;
	export let infiniteId;
</script>

{#if rows.length > 0}
	<TanTable
		{prefix}
		bind:data={rows}
		bind:cols={colsData}
		{idColName}
		on:hideColumn
		{infiniteHandler}
		on:rowClicked
		on:rowSelectionChange
	/>
{/if}
