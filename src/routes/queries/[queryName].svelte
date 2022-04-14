<script>
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import client from '$lib/utils/urql_client';
	import Table from '$lib/components/Table.svelte';
	import { urqlClient } from '$lib/stores/urqlClient';
	import {
		getQueryInfo,
		getCurrentQueryNameForType,
		getQueryFromRootTypes,
		getScalarFieldsNames
	} from '$lib/utils/usefulFunctions';
	setClient($urqlClient);
	let queryName = $page.params.queryName;

	let currentQueryInfo = getQueryInfo($introspectionResult.queryFields, queryName);
	let currentQueryNameForType = getCurrentQueryNameForType(currentQueryInfo);
	let currentQuery = getQueryFromRootTypes($introspectionResult.rootTypes, currentQueryNameForType);
	let currentQuery_fields_SCALAR_names = getScalarFieldsNames(currentQuery);

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

	///////

	let columns = currentQuery_fields_SCALAR_names;
	let rows = [];
</script>

{#if $queryStore.fetching}
	<p>Loading...</p>
{:else if $queryStore.error}
	<p>Oh no... {$queryStore.error.message}</p>
{:else}
	<Table {columns} rows={$queryStore.data[queryName]} />
{/if}
