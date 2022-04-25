<script>
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import client from '$lib/utils/urql_client';
	import Table from '$lib/components/Table.svelte';
	import { urqlClient } from '$lib/stores/urqlClient';
	import { urqlCoreClient } from '$lib/stores/urqlCoreClient';

	import {
		getQM_Field,
		getRootType,
		getRootType_Name,
		getRootType_NamesArray,
		getFields_Grouped,
		getArguments_withInfo,
		getRootType_KindsArray,
		buildQueryBody,
		generateQueryFragments,
		generateFragmentData
	} from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount } from 'svelte';
	import TestUrqlCore from '$lib/components/TestUrqlCore.svelte';
	setClient($urqlClient);
	let queryName = $page.params.queryName;
	onDestroy(() => {
		document.getElementById('my-drawer-3')?.click();
	});

	let currentQueryInfo = getQM_Field($introspectionResult.queryFields, queryName);
	let currentQueryNameForType = getRootType_Name(getRootType_NamesArray(currentQueryInfo));
	let currentQueryFromRootTypes = getRootType(
		$introspectionResult.rootTypes,
		currentQueryNameForType
	);

	let { scalarFields, non_scalarFields } = getFields_Grouped(currentQueryFromRootTypes);
	let arguments_withInfo = getArguments_withInfo(currentQueryInfo);

	let currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
		return field.name;
	});

	let currentQuery_fields_non_scalar_names = non_scalarFields.map((field) => {
		return field.name;
	});

	let scalarColsData = currentQuery_fields_SCALAR_names.map((name) => {
		return { title: name, queryFragment: name };
	});
	let non_scalarColsData = [];
	let tableColsData = [];
	tableColsData = [...scalarColsData];

	let queryFragments;
	let queryBody;
	let queryData = { fetching: true, error: false, data: false };

	const runQuery = () => {
		queryFragments = generateQueryFragments(tableColsData);
		queryBody = buildQueryBody(queryName, queryFragments);
		console.log(queryBody);

		$urqlCoreClient
			.query(queryBody)
			.toPromise()
			.then((result) => {
				if (result.data) {
					queryData = { fetching: false, error: false, data: result.data };
					console.log('queryData', queryData);
				} else {
					console.log('---error---', result.error.message);
					queryData = { fetching: false, error: result.error.message, data: false };
				}

				console.log('result', result); // { data: ... }
			});
	};

	runQuery();

	const addColumn = (field, inUse) => {
		let fieldName = field.name;
		let isScalar = getRootType_KindsArray(field).includes('SCALAR');
		if (!inUse) {
			if (isScalar) {
				tableColsData = [...tableColsData, { title: fieldName, queryFragment: fieldName }];
			} else {
				let fragmentDataFlattenDeep = generateFragmentData(field, $introspectionResult.rootTypes);
				fragmentDataFlattenDeep[1] = fragmentDataFlattenDeep[1].map((field) => {
					return generateFragmentData(field, $introspectionResult.rootTypes, true);
				});

				let fragmentDataFlatten = generateFragmentData(field, $introspectionResult.rootTypes, true);

				tableColsData = [
					...tableColsData,
					{
						title: fieldName,
						queryFragment: fragmentDataFlatten
					}
				];
			}
			runQuery();
			console.log('tableColsData', tableColsData);
		}
	};
	const hideColumn = (e) => {
		tableColsData = tableColsData.filter((colData) => {
			return colData.title !== e.detail.column;
		});

		console.log('hideColumn', e.detail);
	};

	let columns = [];
	let rows = queryData.data[queryName];
	$: columns = tableColsData.map((colData) => {
		return colData.title;
	});
	$: if (queryData.data) {
		rows = queryData.data[queryName];
		console.log('aaaa', typeof rows === 'object');

		if (!rows?.length) {
			if (typeof rows === 'object') {
				rows = [Object.values(rows)];
			} else {
				rows = [rows];
			}
		}
	}
</script>

{#if queryData.fetching}
	<p>Loading...</p>
{:else if queryData.error}
	<p>Oh no... {queryData.error}</p>
{:else}
	<Table
		{columns}
		{rows}
		on:addColumnDropdown={() => {
			console.log('add column dropdown');
		}}
		on:hideColumn={(e) => {
			hideColumn(e);
		}}
	>
		<div slot="addColumnDisplay" class="max-h-52 overflow-y-auto overscroll-y-contain">
			<div class="flex flex-col overflow-x-auto text-sm font-normal normal-case w-full space-y-2">
				{#each currentQueryFromRootTypes.fields as field}
					{@const isScalar = getRootType_KindsArray(field).includes('SCALAR')}
					{@const inUse = tableColsData.find((colData) => {
						return colData.title == field.name;
					})}
					<div class="w-full cursor-pointer  hover:text-primary p-2 rounded-box flex ">
						<div
							class="w-full pr-2 {inUse ? 'cursor-no-drop hover:text-base-300 text-base-200' : ''}"
							on:click={() => {
								addColumn(field, inUse);
							}}
						>
							{field.name}
						</div>
						{#if !isScalar}
							<div class="bi bi-chevron-down" />
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div slot="changeArguments">
			<div class="flex flex-col overflow-x-auto text-sm font-normal normal-case w-full space-y-2">
				{#each arguments_withInfo as arg}
					<div class="w-full cursor-pointer  hover:text-primary p-2 rounded-box flex">
						<div class="w-full pr-2">{arg.arg.name}</div>
						{#if !arg.kindsArray.includes('SCALAR')}
							<div class="bi bi-chevron-down" />
						{/if}
					</div>
				{/each}
			</div>
			<div class="flex justify-end pr-2 pt-2">
				<button class="btn btn-sm btn-primary justify-right" on:click={runQuery}>apply</button>
			</div>
		</div>
	</Table>
{/if}
