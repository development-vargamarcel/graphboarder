<script lang="ts">
	/**
	 * Table component wrapper around TanTable.
	 * Supports CSV and JSON export, row selection, and infinite scrolling.
	 */
	import TanTable from './TanTable.svelte';
	import { downloadCSV, downloadJSON, convertArrayToCSV } from '$lib/utils/exportUtils';
	import { Logger } from '$lib/utils/logger';

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
		<div class="flex justify-end mb-2 space-x-2">
			<button
				class="btn btn-sm btn-outline gap-2"
				onclick={() => {
					Logger.info('User initiated CSV Export', { rowCount: rows.length });
					if (rows && rows.length > 0) {
						downloadCSV(rows, 'export.csv');
					} else {
						Logger.warn('Export CSV failed: No rows to export');
					}
				}}
			>
				<i class="bi bi-download"></i>
				Export CSV
			</button>
			<button
				class="btn btn-sm btn-outline gap-2"
				onclick={() => {
					Logger.info('User initiated JSON Export', { rowCount: rows.length });
					if (rows && rows.length > 0) {
						downloadJSON(rows, 'export.json');
					} else {
						Logger.warn('Export JSON failed: No rows to export');
					}
				}}
			>
				<i class="bi bi-filetype-json"></i>
				Export JSON
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
