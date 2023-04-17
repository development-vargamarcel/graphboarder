<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	export let prefix = '';
	import {
		formatData,
		getDataGivenStepsOfFields,
		getTableCellData
	} from '$lib/utils/usefulFunctions';
	import InfiniteLoading from 'svelte-infinite-loading';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import ColumnInfo from '$lib/components/ColumnInfo.svelte';
	import TanTable from './TanTable.svelte';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	let QMSWraperContext = getContext(`${prefix}QMSWraperContext`);

	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	const QMS_info = QMSWraperContext?.QMS_info;
	let idColName = endpointInfo.get_idField(QMS_info, schemaData)?.dd_displayName;
	export let colsData = [];
	export let showCheckBox = false;
	let visibleColsData = [];
	let visibleColumns = [];
	$: {
		visibleColsData = colsData.filter((colData) => {
			return !colData?.hidden;
		});
		visibleColumns = visibleColsData.map((colData) => {
			return colData.title;
		});
	}

	export let rows = [];
	export let infiniteHandler;
	export let infiniteId;
	const dispatch = createEventDispatcher();
	const { paginationOptions } = getContext(`${prefix}QMSWraperContext`);
	let loadMore = false;
</script>

{#if rows.length > 0}
	<TanTable
		bind:data={rows}
		bind:cols={colsData}
		{idColName}
		on:hideColumn
		{infiniteHandler}
		on:rowClicked
		on:rowSelectionChange
	/>
{/if}
