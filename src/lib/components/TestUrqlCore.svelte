<script>
	import { setClient, getClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import Table from '$lib/components/Table.svelte';
	import { urqlCoreClient } from '$lib/stores/urqlCoreClient';

	import {
		getQM_Field,
		getRootType,
		get_mainName,
		get_NamesArray,
		getFields_Grouped,
		getArguments_withInfo,
		get_KindsArray
	} from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount } from 'svelte';

	setClient($urqlCoreClient);

	export let queryName = '';
	console.log(queryName);
	onDestroy(() => {
		document.getElementById('my-drawer-3').click();
	});

	let currentQueryInfo = getQM_Field($introspectionResult.queryFields, queryName);
	let currentQueryNameForType = get_mainName(get_NamesArray(currentQueryInfo));
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
	let queryStore;
	queryStore = operationStore(queryBody);
	query(queryStore);

	const addColumnScalar = (fieldName, inUse) => {
		if (!inUse) {
			tableColsData = [...tableColsData, { title: fieldName, queryFragment: fieldName }];
		}
		//queryStore.reexecute();
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

	//

	$urqlCoreClient
		.query(queryBody)
		.toPromise()
		.then((result) => {
			console.log('result', result); // { data: ... }
		});
	///////
</script>
