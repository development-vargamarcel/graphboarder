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
		getArguments_withInfo
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

	let queryBody = `
    query MyQuery {
  ${queryName} {
${currentQuery_fields_SCALAR_names?.join('\n')}
  }
}
    `;
	console.log(queryBody);
	const queryStore = operationStore(queryBody);
	query(queryStore);

	const runQuery = () => {
		query(queryStore);
	};
	///////

	let columns = currentQuery_fields_SCALAR_names;
	let rows = [];
</script>

{#if currentQuery_fields_SCALAR_names}
	{#if $queryStore.fetching}
		<p>Loading...</p>
	{:else if $queryStore.error}
		<p>Oh no... {$queryStore.error.message}</p>
	{:else}
		<Table
			{columns}
			rows={$queryStore.data[queryName]}
			on:addColumn={() => {
				console.log('add column');
			}}
		>
			<div slot="addColumnDisplay">
				<div class="flex flex-col overflow-x-auto text-sm font-normal normal-case w-full space-y-2">
					{#each scalarFields as field}
						<div class="w-full cursor-pointer  hover:text-primary p-2 rounded-box flex">
							<div class="w-full pr-2">{field.name}</div>
						</div>
					{/each}
					{#each non_scalarFields as field}
						<div class="w-full cursor-pointer  hover:text-primary p-2 rounded-box flex">
							<div class="w-full pr-2">{field.name}</div>
							<div class="bi bi-chevron-down" />
						</div>
					{/each}
				</div>
				<div class="flex justify-end pr-2  pt-2">
					<button class="btn btn-sm btn-primary justify-right" on:click={runQuery}>add</button>
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
{:else}
	no scalar fields
{/if}
