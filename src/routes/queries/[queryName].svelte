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
		getFields_Grouped
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

<div class="flex flex-col">
	<div class="w-full">non scalar fields</div>
	<div class="w-full">{currentQuery_fields_non_scalar_names}</div>
	<button class="btn btn-sm btn-primary">fetch</button>
</div>
{#if $queryStore.fetching}
	<p>Loading...</p>
{:else if $queryStore.error}
	<p>Oh no... {$queryStore.error.message}</p>
{:else}
	<Table {columns} rows={$queryStore.data[queryName]} />
{/if}
