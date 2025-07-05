<script lang="ts">
	import TanTable from './TanTable.svelte';

	interface Props {
		prefix?: string;
		enableMultiRowSelectionState?: boolean;
		colsData?: any;
		showCheckBox?: boolean;
		rows?: any;
		infiniteHandler: any;
		infiniteId: any;
		rowSelectionState: any;
	}

	let {
		prefix = '',
		enableMultiRowSelectionState = true,
		colsData = $bindable([]),
		showCheckBox = false,
		rows = $bindable([]),
		infiniteHandler,
		infiniteId,
		rowSelectionState
	}: Props = $props();
</script>

{#if rows.length > 0}
	<TanTable
		{rowSelectionState}
		{enableMultiRowSelectionState}
		{prefix}
		bind:data={rows}	
		bind:cols={colsData}
		on:hideColumn
		{infiniteHandler}
		on:rowClicked
		on:rowSelectionChange
	/>
{:else}
	no rows
{/if}
