<script>
	import { formatData } from '$lib/utils/usefulFunctions';
	import ExplorerTable from './ExplorerTable.svelte';

	export let selectedRowsColValues;
	export let idColName;
	$: columns = Object.keys(selectedRowsColValues[0]).map((columnName) => {
		return {
			accessorFn: (row) => formatData(row[columnName], 40, true),
			header: columnName,
			footer: columnName,
			enableHiding: true
		};
	});
</script>

{#key selectedRowsColValues && idColName}
	{#if selectedRowsColValues}
		<div class=" max-w-[80vw] md:max-w-[50vw] pl-1 pr-2">
			<ExplorerTable
				bind:idColName
				enableRowSelection={false}
				bind:data={selectedRowsColValues}
				bind:columns
			/>
		</div>
	{/if}
{/key}
