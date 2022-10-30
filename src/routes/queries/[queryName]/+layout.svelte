<script>
	import { Create_fulfilledQuery_Store } from './../../../lib/stores/fulfilledQuery_Store.ts';
	import { getStores, navigating, page, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';
	import Table from '$lib/components/Table.svelte';
	import { urqlClient } from '$lib/stores/urqlClient';
	import { urqlCoreClient } from '$lib/stores/urqlCoreClient';
	const fulfilledQuery_Store = Create_fulfilledQuery_Store();
	setContext('fulfilledQuery_Store', fulfilledQuery_Store);
	fulfilledQuery_Store.subscribe((data) => {
		console.log(data);
	});

	import { Create_tableColsData_Store } from '$lib/stores/tableColsData_Store';
	const tableColsData_Store = Create_tableColsData_Store();
	setContext('tableColsData_Store', tableColsData_Store);
	tableColsData_Store.subscribe((data) => {
		console.log(data);
	});
	import {
		getFields_Grouped,
		buildQueryBody,
		stepsOfFieldsNewToQueryFragmentObject,
		queryFragmentsObjectsToQueryFields
	} from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount, setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { schemaData } from '$lib/stores/schemaData';
	setClient($urqlClient);
	let queryName = $page.params.queryName;
	onDestroy(() => {
		document.getElementById('my-drawer-3')?.click();
	});

	let currentQueryInfo = schemaData.get_QMS_Field(queryName, 'query');
	let dd_relatedRoot = currentQueryInfo?.dd_relatedRoot;
	if (!currentQueryInfo) {
		goto('/queries');
	}

	let { scalarFields, non_scalarFields } = getFields_Grouped(dd_relatedRoot);
	let currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
		return field.name;
	});

	let scalarColsData = currentQuery_fields_SCALAR_names.map((name) => {
		return {
			title: name,
			queryFragment: name,
			queryFragmentNew: name,
			stepsOfFieldsNew: [name],
			queryFragmentObject: stepsOfFieldsNewToQueryFragmentObject([name])
		};
	});
	let non_scalarColsData = [];
	tableColsData_Store.set([...scalarColsData]);

	let queryFragmentsObjectsNew;
	let queryBody;
	let queryData;
	let gqlArgObj_string;
	let columns = [];
	let rows = [];
	const runQuery = () => {
		queryFragmentsObjectsNew = $tableColsData_Store
			.filter((colData) => {
				return colData.queryFragmentObject !== undefined;
			})
			.map((colData) => {
				return colData.queryFragmentObject;
			});
		console.log({ queryFragmentsObjectsNew });
		queryBody = buildQueryBody(
			queryName,
			queryFragmentsObjectsToQueryFields(queryFragmentsObjectsNew),
			gqlArgObj_string
		);
		let fetching = true;
		let error = false;
		let data = false;
		$urqlCoreClient
			.query(queryBody)
			.toPromise()
			.then((result) => {
				fetching = false;

				if (result.data) {
					data = result.data;
				}

				if (result.error) {
					error = result.error.message;
				}
				queryData = { fetching, error, data };

				rows = queryData.data[queryName];

				if (rows?.length == undefined) {
					rows = [rows];
				}
			});
	};
	if (scalarFields.length == 0) {
		queryData = { fetching: false, error: false, data: false };
	} else {
		queryData = { fetching: true, error: false, data: false };
		runQuery();
	}

	const hideColumn = (e) => {
		tableColsData_Store.removeColumn(e.detail.column);
		runQuery(); //ctually is fine even if i do not rerun here,data is already here... usefull only for subscriptions maybe
	};

	rows = queryData.data[queryName];
	$: columns = $tableColsData_Store.map((colData) => {
		return colData.title;
	});
	$: if (queryData.fetching) {
		rows = queryData.data[queryName];

		if (rows?.length == undefined) {
			rows = [rows];
		}
	}

	let column_stepsOfFieldsNew = '';
	const addColumnFromInput = (e) => {
		if (e.key == 'Enter') {
			let stepsOfFieldsNew = column_stepsOfFieldsNew
				.replace(/\s/g, '')
				.replace(/\./g, '>')
				.split('>');
			let tableColData = {
				title: `col-${Math.floor(Math.random() * 200)}`,
				stepsOfFieldsNew: stepsOfFieldsNew,
				queryFragmentObject: stepsOfFieldsNewToQueryFragmentObject(stepsOfFieldsNew)
			};
			tableColsData_Store.addColumn(tableColData);
			column_stepsOfFieldsNew = '';
		}
	};

	//Active arguments logic
	let activeArgumentsData = [];
</script>

<ActiveArguments
	argsInfo={currentQueryInfo?.args}
	{activeArgumentsData}
	on:argsChanged={(e) => {
		gqlArgObj_string = e.detail.gqlArgObj_string;
		runQuery();
	}}
/>

<slot />

{#if queryData.fetching}
	<p>Loading...</p>
{:else if queryData.error}
	<p>Oh no... {queryData.error}</p>
{:else}
	<Table
		colsData={$tableColsData_Store}
		{columns}
		{rows}
		on:addColumnDropdown={() => {
			//console.log('add column dropdown');
		}}
		on:hideColumn={(e) => {
			hideColumn(e);
		}}
		on:clickedOnRow={(e) => {}}
	>
		<div
			slot="addColumnDisplay"
			class="max-h-52 sm:max-h-72 md:max-h-90 overflow-auto overscroll-contain max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
		>
			<div
				class="flex flex-col overflow-x-auto text-sm font-normal normal-case min-w-max  w-full  space-y-2"
			>
				{#key dd_relatedRoot?.fields}
					<input
						type="text"
						class="input input-sm input-bordered input-accent m-2"
						placeholder="(> or .) producer>films>title "
						bind:value={column_stepsOfFieldsNew}
						on:keypress={addColumnFromInput}
					/>
					{#each dd_relatedRoot.fields as type, index (index)}
						<Type
							{index}
							{type}
							template="columnAddDisplay"
							stepsOfFieldsNew={[]}
							depth={0}
							on:colAddRequest={(e) => {
								tableColsData_Store.addColumn(e.detail);
								runQuery();
								dd_relatedRoot.fields = dd_relatedRoot.fields; // this and key is used to re-render Type
							}}
						/>
					{/each}
				{/key}
			</div>
		</div>
	</Table>
{/if}
