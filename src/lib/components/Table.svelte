<script lang="ts">
	export let prefix = '';
	import TanTable from './TanTable.svelte';

	export let enableMultiRowSelectionState = true;
	export let colsData = [];
	export let showCheckBox = false;
	export let rows = [];
	export let infiniteHandler;
	export let infiniteId;
	export let rowSelectionState;
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
