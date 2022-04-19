<script>
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import client from '$lib/utils/urql_client';
	import Table from '$lib/components/Table.svelte';
	import { urqlClient } from '$lib/stores/urqlClient';
	import {
		getQM_Field,
		getRootType,
		getRootType_Name,
		getRootType_NamesArray,
		getFields_Grouped,
		getArguments_withInfo,
		getRootType_KindsArray
	} from '$lib/utils/usefulFunctions';
	setClient($urqlClient);
	let queryName = $page.params.queryName;

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

	//
	let scalarColsData = currentQuery_fields_SCALAR_names.map((name) => {
		return { title: name, queryFragment: name };
	});
	let non_scalarColsData = [];
	let tableColsData = [];
	$: tableColsData = [...scalarColsData];

	let queryFragments_scalar = scalarColsData
		.map((colData) => {
			let fragment;
			fragment = colData.queryFragment;
			return fragment;
		})
		?.join('\n');
	//
	let queryBody = ``;
	queryBody = `
    query MyQuery {
  ${queryName} {
${queryFragments_scalar}
  }
}
    `;
	console.log(queryBody);

	const queryStore = operationStore(queryBody);
	query(queryStore);

	const addColumnScalar = (fieldName, inUse) => {
		if (!inUse) {
			tableColsData = [...tableColsData, { title: fieldName, queryFragment: fieldName }];
		}
	};
	const hideField = (e) => {
		tableColsData = tableColsData.filter((colData) => {
			return colData.title !== e.detail.column;
		});
		console.log('hideField', e.detail);
	};
	const runQuery = () => {
		query(queryStore);
	};
	///////
	let columns = [];
	$: columns = tableColsData.map((colData) => {
		return colData.title;
	});
	let rows = [];
</script>

{#if $queryStore.fetching}
	<p>Loading...</p>
{:else if $queryStore.error}
	<p>Oh no... {$queryStore.error.message}</p>
{:else}
	<Table
		{columns}
		rows={$queryStore.data[queryName]}
		on:addColumnDropdown={() => {
			console.log('add column dropdown');
		}}
		on:hideField={(e) => {
			hideField(e);
		}}
	>
		<div slot="addColumnDisplay">
			<div class="flex flex-col overflow-x-auto text-sm font-normal normal-case w-full space-y-2">
				{#each currentQueryFromRootTypes.fields as field}
					{@const isScalar = getRootType_KindsArray(field).includes('SCALAR')}
					{@const inUse_Scalar = isScalar
						? tableColsData.find((colData) => {
								return colData.queryFragment == field.name;
						  })
						: false}
					<div
						class="w-full cursor-pointer  hover:text-primary p-2 rounded-box flex {inUse_Scalar
							? 'cursor-no-drop hover:text-neutral-focus text-neutral'
							: ''}"
					>
						<div
							class="w-full pr-2"
							on:click={() => {
								addColumnScalar(field.name, inUse_Scalar);
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
