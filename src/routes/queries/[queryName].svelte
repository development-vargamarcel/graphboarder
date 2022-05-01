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
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	setClient($urqlClient);
	let queryName = $page.params.queryName;
	onDestroy(() => {
		document.getElementById('my-drawer-3')?.click();
	});

	let currentQueryInfo = getQM_Field($introspectionResult.queryFields, queryName);
	if (!currentQueryInfo) {
		goto('/queries');
	}

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
		return { title: name, queryFragment: name, queryFragmentNew: name, stepsOfFieldsNew: [name] };
	});
	let non_scalarColsData = [];
	let tableColsData = [];

	let queryFragmentFor_businesses_ingredients_PRECISE = [
		'businesses_ingredients',
		[['ing_id', [['user_created', [['role', ['name']]]]]]]
	];

	let queryFragmentFor_businesses_ingredients_ALL = [
		'businesses_ingredients',
		[
			'id',
			'status',
			'sort',
			[
				'user_created',
				[
					'id',
					'first_name',
					'last_name',
					'email',
					'password',
					'location',
					'title',
					'description',
					'tags',
					'language',
					'theme',
					'tfa_secret',
					'status',
					'token',
					'last_access',
					'last_page',
					'provider',
					'external_identifier',
					'auth_data',
					'email_notifications'
				]
			],
			'date_created',
			[
				'date_created_func',
				['year', 'month', 'week', 'day', 'weekday', 'hour', 'minute', 'second']
			],
			[
				'user_updated',
				[
					'id',
					'first_name',
					'last_name',
					'email',
					'password',
					'location',
					'title',
					'description',
					'tags',
					'language',
					'theme',
					'tfa_secret',
					'status',
					'token',
					'last_access',
					'last_page',
					'provider',
					'external_identifier',
					'auth_data',
					'email_notifications'
				]
			],
			'date_updated',
			[
				'date_updated_func',
				['year', 'month', 'week', 'day', 'weekday', 'hour', 'minute', 'second']
			],
			['ing_id', ['id', 'status', 'sort', 'date_created', 'date_updated', 'name']],
			[
				'bus_id',
				['id', 'status', 'sort', 'date_created', 'date_updated', 'name', 'location', 'serving_area']
			]
		]
	];

	tableColsData = [
		...scalarColsData
		// {
		// 	title: 'test',
		// 	queryFragment: [
		// 		'businesses_ingredients',
		// 		[['ing_id', [['user_created', [['role', [['users', ['email']]]]]]]]]
		// 	]
		// }
	];
	console.log('tableColsData', tableColsData);
	let queryFragments;
	let queryFragmentsNew;
	let queryBody;
	let queryData = { fetching: true, error: false, data: false };

	const runQuery = () => {
		queryFragments = generateQueryFragments(tableColsData);
		queryFragmentsNew = tableColsData
			.filter((colData) => {
				return colData.queryFragmentNew !== undefined;
			})
			.map((colData) => {
				return colData.queryFragmentNew;
			});
		console.log('tableColsData queryFragmentsNew', queryFragmentsNew);
		console.log('queryFragments', queryFragments);
		queryBody = buildQueryBody(queryName, queryFragmentsNew.join('\n'));
		console.log('queryBody', queryBody);
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
				console.log('result', result); // { data: ... }
				console.log('queryData', queryData);
			});
	};

	runQuery();

	const addColumn = (field, inUse) => {
		let runTheQuery = true;
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

				console.log('fragmentDataFlattenDeep', fragmentDataFlattenDeep);
				let fragmentDataFlatten = generateFragmentData(field, $introspectionResult.rootTypes, true);
				console.log('fragmentDataFlatten', fragmentDataFlatten);
				if (fragmentDataFlatten) {
					tableColsData = [
						...tableColsData,
						{
							title: fieldName,
							queryFragment: fragmentDataFlattenDeep
						}
					];
				} else {
					runTheQuery = false;
					console.error(
						'cannot add this column because it doesn t have scalar fields or is not set to go deeper till it finds scalars'
					);
				}
			}
			if (runTheQuery) {
				runQuery();
				console.log('tableColsData', tableColsData);
			}
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
		console.log('**** queryData.data[queryName]', rows);

	
			//if (typeof rows === 'object' && !(rows?.length>=2)) {
				//if (rows !== undefined&& rows !== null) {
				//	rows = [[rows]];
			//	} else {
				//	rows = [];
			//	}
			//} else {
				//rows = [rows];
			//}
		
		console.log('**** rows', rows);
	}
</script>
{JSON.stringify(rows)} 
{#if queryData.fetching}
	<p>Loading...</p>
{:else if queryData.error}
	<p>Oh no... {queryData.error}</p>
{:else}
	<Table
		colsData={tableColsData}
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
				{#key currentQueryFromRootTypes.fields}
					{#each currentQueryFromRootTypes.fields as type, index (index)}
						<Type
							{index}
							{type}
							template="columnAddDisplay"
							stepsOfFields={[]}
							stepsOfFieldsNew={[]}
							depth={0}
							on:colAddRequest={(e) => {
								console.log(e);
								tableColsData = [...tableColsData, e.detail];
								console.log('tableColsData', tableColsData);
								runQuery();
								currentQueryFromRootTypes.fields = currentQueryFromRootTypes.fields; // this and key is used to re-render Type
							}}
						/>
					{/each}
				{/key}
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
