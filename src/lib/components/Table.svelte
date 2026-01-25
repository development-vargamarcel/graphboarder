<script lang="ts">
	import TanTable from './TanTable.svelte';
	import { downloadCSV, convertArrayToCSV } from '$lib/utils/exportUtils';

	interface Props {
		prefix?: string;
		enableMultiRowSelectionState?: boolean;
		enableExport?: boolean;
		colsData?: any;
		showCheckBox?: boolean;
		rows?: any;
		infiniteHandler: any;
		infiniteId: any;
		rowSelectionState?: any;
		onRowSelectionChange?: (detail: any) => void;
		onHideColumn?: (detail: { column: string }) => void;
		onRowClicked?: (detail: any) => void;
	}

	let {
		prefix = '',
		enableMultiRowSelectionState = true,
		enableExport = true,
		colsData = $bindable([]),
		showCheckBox = false,
		rows = $bindable([]),
		infiniteHandler,
		infiniteId,
		rowSelectionState = $bindable({}),
		onRowSelectionChange,
		onHideColumn,
		onRowClicked
	}: Props = $props();
</script>

{#if rows.length > 0}
	{#if enableExport}
		<div class="flex justify-end mb-2">
			<button
				class="btn btn-sm btn-outline gap-2"
				onclick={() => {
					if (rows && rows.length > 0) {
						downloadCSV(rows, 'export.csv');
					}
				}}
			>
				<i class="bi bi-download"></i>
				Export CSV
			</button>
		</div>
	{/if}
	<TanTable
		{rowSelectionState}
		{enableMultiRowSelectionState}
		{prefix}
		bind:data={rows}
		cols={colsData}
		{onHideColumn}
		{infiniteHandler}
		{onRowClicked}
		{onRowSelectionChange}
	/>
{:else}
	no rows
{/if}
