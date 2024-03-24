<script>
	import { formatData } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import ExplorerTable from './ExplorerTable.svelte';

	export let prefix = '';
	const nodeContext_forDynamicData = getContext(`${prefix}nodeContext_forDynamicData`);
	let idColName = nodeContext_forDynamicData.idColName;
	let selectedRowsColValues = nodeContext_forDynamicData.selectedRowsColValues;
	let columns;
	$: if ($selectedRowsColValues) {
		if ($selectedRowsColValues?.length > 0) {
			columns = Object.keys($selectedRowsColValues[0]).map((columnName) => {
				return {
					accessorFn: (row) => formatData(row[columnName], 40, true),
					header: columnName,
					footer: columnName,
					enableHiding: true
				};
			});
		}
	}
</script>

{#key $selectedRowsColValues}
	{#if $selectedRowsColValues?.length > 0}
		<div class=" max-w-[80vw] md:max-w-[50vw] pl-1 pr-2">
			<ExplorerTable
				bind:idColName={$idColName}
				enableRowSelection={false}
				data={$selectedRowsColValues}
				{columns}
			/>
		</div>
	{/if}
{/key}
