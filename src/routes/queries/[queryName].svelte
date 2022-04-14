<script>
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import client from '$lib/utils/urql_client';
	import Table from '$lib/components/Table.svelte';
	import { urqlClient } from '$lib/stores/urqlClient';
	console.log($urqlClient);
	setClient($urqlClient);
	let queryName = $page.params.queryName;
	console.log('-----------', queryName);

	let currentQuery = $introspectionResult.rootTypes.filter((query) => {
		return query.name == queryName;
	})[0];
	let currentQuery_fields = currentQuery.fields;
	let currentQuery_fields_SCALAR = currentQuery_fields.filter((field) => {
		if (field?.type?.kind == 'SCALAR' || field.type?.ofType?.kind == 'SCALAR') {
			return true;
		}
	});
	console.log(currentQuery);
	console.log(currentQuery_fields);
	console.log(currentQuery_fields_SCALAR);
	let currentQuery_fields_SCALAR_name = currentQuery_fields_SCALAR.map((field) => {
		return field.name;
	});

	console.log(currentQuery_fields_SCALAR_name);
	let queryBody = `
    query MyQuery {
  ${queryName} {
${currentQuery_fields_SCALAR_name.join('\n')}
  }
}
    `;
	console.log(queryBody);
	const queryStore = operationStore(queryBody);
	query(queryStore);

	///////

	let columns = currentQuery_fields_SCALAR_name;
	let rows = [];
</script>

{#if $queryStore.fetching}
	<p>Loading...</p>
{:else if $queryStore.error}
	<p>Oh no... {$queryStore.error.message}</p>
{:else}
	<Table {columns} rows={$queryStore.data[queryName]} />
{/if}
