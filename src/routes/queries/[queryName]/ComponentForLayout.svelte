<script>
	import { page } from '$app/stores';
	//import { setClient } from '@urql/svelte';
	import Table from '$lib/components/Table.svelte';
	//import { urqlClient } from '$lib/stores/urqlClient';
	import { urqlCoreClient } from '$lib/stores/urqlCoreClient';

	let queryName = $page.params.queryName;

	const activeArgumentsDataGrouped_Store = getContext('activeArgumentsDataGrouped_Store');
	const tableColsData_Store = getContext('tableColsData_Store');
	const final_gqlArgObj_Store = getContext('final_gqlArgObj_Store');
	const QMS_bodyPart_StoreDerived = getContext('QMS_bodyPart_StoreDerived');

	$: console.log('final_gqlArgObj_Store', $final_gqlArgObj_Store);
	import { getFields_Grouped } from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { schemaData } from '$lib/stores/schemaData';
	//setClient($urqlClient);
	$: console.log('$QMS_bodyPart_StoreDerived', $QMS_bodyPart_StoreDerived);
	onDestroy(() => {
		document.getElementById('my-drawer-3')?.click();
	});

	let currentQueryInfo = schemaData.get_QMS_Field(queryName, 'query');
	let dd_relatedRoot = currentQueryInfo?.dd_relatedRoot;
	if (!currentQueryInfo) {
		goto('/queries');
	}

	let { scalarFields } = getFields_Grouped(dd_relatedRoot);
	let currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
		return field.name;
	});

	let scalarColsData = currentQuery_fields_SCALAR_names.map((name) => {
		let scalarColData = {
			title: name,
			stepsOfFields: [queryName, name]
		};
		return scalarColData;
	});
	tableColsData_Store.set([...scalarColsData]);

	let queryData;
	let columns = [];
	let rows = [];

	const runQuery = (queryBody) => {
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
				if (queryData.data[queryName]?.edges) {
					//needed for: https://swapi-graphql.netlify.app/.netlify/functions/index
					rows = queryData.data[queryName]?.edges;
				} else if (queryData.data[queryName]?.results) {
					//needed for:https://rickandmortyapi.com/graphql
					rows = queryData.data[queryName]?.results;
				} else if (queryData.data[queryName]?.nodes) {
					//needed for:https://beta.pokeapi.co/graphql/v1beta
					rows = queryData.data[queryName]?.nodes;
				} else {
					rows = queryData.data[queryName];
				}

				if (rows?.length == undefined) {
					rows = [rows];
				}
			});
	};
	QMS_bodyPart_StoreDerived.subscribe((QMS_body) => {
		if (QMS_body && QMS_body !== '') {
			runQuery(
				`query {
				${QMS_body}
		}
				`
			);
		}
	});
	$: console.log({ queryData });
	if (scalarFields.length == 0) {
		queryData = { fetching: false, error: false, data: false };
	} else {
		queryData = { fetching: true, error: false, data: false };
	}

	const hideColumn = (e) => {
		tableColsData_Store.removeColumn(e.detail.column);
	};
	tableColsData_Store.subscribe((data) => {
		console.log(data);
		columns = data.map((colData) => {
			return colData.title;
		});
	});

	let column_stepsOfFields = '';
	const addColumnFromInput = (e) => {
		if (e.key == 'Enter') {
			let stepsOfFields = column_stepsOfFields.replace(/\s/g, '').replace(/\./g, '>').split('>');
			let tableColData = {
				title: `col-${Math.floor(Math.random() * 200)}`,
				stepsOfFields: [queryName, ...stepsOfFields]
			};

			tableColsData_Store.addColumn(tableColData);
			column_stepsOfFields = '';
		}
	};

	//Active arguments logic
	let activeArgumentsData = [];
</script>

<div class="flex space-x-2">
	<div class="dropdown grow ">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<label tabindex="0" class="btn btn-xs bi bi-node-plus-fill text-lg p-1 ml-2  w-full" />
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			tabindex="0"
			class="dropdown-content menu p-2 shadow bg-base-100 rounded-box ==w-max max-w-screen text-sm shadow-2xl"
		>
			<div
				class="max-h-[70vh] sm:max-h-[80vh] md:max-h-[80vh] overflow-auto overscroll-contain max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
			>
				<div
					class="flex flex-col overflow-x-auto text-sm font-normal normal-case min-w-max  w-full  space-y-2"
				>
					<input
						type="text"
						class="input input-sm input-bordered input-accent m-2"
						placeholder="(> or .) producer>films>title "
						bind:value={column_stepsOfFields}
						on:keypress={addColumnFromInput}
					/>
					{#each dd_relatedRoot.fields as type, index (index)}
						<Type
							{index}
							{type}
							template="columnAddDisplay"
							stepsOfFields={[queryName]}
							depth={0}
							on:colAddRequest={(e) => {
								let tableColData = e.detail;
								//tableColData.stepsOfFields = [queryName, ...tableColData.stepsOfFields];

								tableColsData_Store.addColumn(tableColData);
							}}
						/>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<div class="grow">
		<ActiveArguments
			argsInfo={currentQueryInfo?.args}
			{activeArgumentsData}
			on:argsChanged={(e) => {}}
		/>
	</div>
</div>

<slot />
{#if queryData.error}
	<div class="px-4 mx-auto  mb-2">
		<div class="alert alert-error shadow-lg ">
			<div>
				<button class="btn btn-ghost btn-sm p-0">
					<svg
						on:click={() => {
							queryData.error = null;
						}}
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current flex-shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
				</button>

				<span class="max-h-20 overflow-auto">{queryData.error}</span>
			</div>
		</div>
	</div>
{/if}
{#if queryData.fetching}
	<p>Loading...</p>
{/if}
{#if queryData.data}
	<div class="md:px-2">
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
		/>
	</div>
{/if}
