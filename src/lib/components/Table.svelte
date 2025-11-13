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
		onRowSelectionChange?: (detail: any) => void;
		onHideColumn?: (detail: { column: string }) => void;
		onRowClicked?: (detail: any) => void;
	}

	let {
		prefix = '',
		enableMultiRowSelectionState = true,
		colsData = $bindable([]),
		showCheckBox = false,
		rows = $bindable([]),
		infiniteHandler,
		infiniteId,
		rowSelectionState,
		onRowSelectionChange,
		onHideColumn,
		onRowClicked
	}: Props = $props();
</script>

{#if rows.length > 0}
	<TanTable
		{rowSelectionState}
		{enableMultiRowSelectionState}
		{prefix}
		bind:data={rows}
		bind:cols={colsData}
		{onHideColumn}
		{infiniteHandler}
		{onRowClicked}
		{onRowSelectionChange}
	/>
{:else}
	no rows
{/if}
