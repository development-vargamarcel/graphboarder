<script>
	import { endpointInfo } from './../../../lib/stores/endpointInfo/endpointInfo.ts';
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
	const QMS_bodyPartsUnifier_StoreDerived = getContext('QMS_bodyPartsUnifier_StoreDerived');

	const offsetBasedPaginationOptions = getContext('offsetBasedPaginationOptions');

	$: console.log('final_gqlArgObj_Store', $final_gqlArgObj_Store);
	import { getDataGivenStepsOfFields, getFields_Grouped } from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { schemaData } from '$lib/stores/schemaData';
	import OffsetPagination from '$lib/components/pagination/OffsetPagination.svelte';
	import { paginationTypes } from '$lib/stores/pagination/paginationTypes';
	import { stringify } from 'postcss';

	//setClient($urqlClient);
	$: console.log('$QMS_bodyPart_StoreDerived', $QMS_bodyPart_StoreDerived);
	onDestroy(() => {
		document.getElementById('my-drawer-3')?.click();
	});

	let currentQMS_Info = schemaData.get_QMS_Field(queryName, 'query');
	let dd_relatedRoot = currentQMS_Info?.dd_relatedRoot;
	if (!currentQMS_Info) {
		goto('/queries');
	}
	//
	let activeArgumentsData = [];
	const paginationTypeInfo = paginationTypes.find((pagType) => {
		return pagType.name == currentQMS_Info.dd_paginationType;
	});
	let activeArgumentsDataGrouped_Store_IS_SET = false;
	$: activeArgumentsDataGrouped_Store_IS_SET =
		$activeArgumentsDataGrouped_Store.length > 0 ? true : false;
	//

	let { scalarFields } = getFields_Grouped(dd_relatedRoot);

	let queryData;
	let rows = [];
	let rowsCurrent = [];
	let loadedF;
	let completeF;
	let infiniteId = 0;
	const paginationState = getContext(`paginationState`);
	function infiniteHandler({ detail: { loaded, complete } }) {
		loadedF = loaded;
		completeF = complete;
		if (rows.length > 0) {
			paginationState.nextPage(queryData?.data, queryName, 'query');
		}
	}
	const runQuery = (queryBody) => {
		console.log('queryBody', queryBody);
		let fetching = true;
		let error = false;
		let data = false;
		$urqlCoreClient
			.query(queryBody)
			.toPromise()
			.then((result) => {
				fetching = false;

				if (result.error) {
					error = result.error.message;
				}
				if (result.data) {
					data = result.data;
				}
				queryData = { fetching, error, data };
				rowsCurrent = getDataGivenStepsOfFields(undefined, queryData.data[queryName], [
					currentQMS_Info.dd_displayName,
					...$endpointInfo.rowsLocationPossibilities.find((rowsLocation) => {
						return rowsLocation.checker(currentQMS_Info);
					}).rowsLocation
				]);

				if (rowsCurrent?.length == undefined) {
					rowsCurrent = [rowsCurrent];
				}
				if ($offsetBasedPaginationOptions.infiniteScroll) {
					console.log(
						'isFirstPage',
						paginationTypeInfo?.isFirstPage(paginationState, currentQMS_Info.dd_paginationArgs)
					);
					if (
						paginationTypeInfo?.isFirstPage(paginationState, currentQMS_Info.dd_paginationArgs) &&
						rowsCurrent?.length > 0
					) {
						infiniteId += 1;
						rows = [...rowsCurrent];
					} else {
						if (rowsCurrent?.[0] != undefined) {
							rows = [...rows, ...rowsCurrent];
						}
					}
				} else {
					rows = rowsCurrent;
				}
				if (
					paginationTypeInfo?.get_rowLimitingArgNames(currentQMS_Info.dd_paginationArgs).length >
						0 &&
					paginationTypeInfo
						?.get_rowLimitingArgNames(currentQMS_Info.dd_paginationArgs)
						.some((argName) => {
							return rowsCurrent?.length == $paginationState?.[argName];
						})
				) {
					loadedF && loadedF();
					console.log('loadedF ');
				} else {
					completeF && completeF();
					console.log('completeF');
				}

				console.log({ rows }, { rowsCurrent });
				rowsCurrent = [];
			});
	};
	QMS_bodyPart_StoreDerived.subscribe((QMS_body) => {
		if (QMS_body && QMS_body !== '') {
			runQuery(
				`query {
				${QMS_body}
		}`
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
	let showQMSBody = false;
	let showNonPrettifiedQMSBody = false;
	import { format } from 'graphql-formatter';
</script>

<!-- <button
	on:click={() => {
		paginationState.nextPage(rows[rows.length - 1], queryData?.data);
	}}
>
	next page
</button> -->
<!-- main -->
<div class="flex space-x-2">
	<button
		class="btn btn-xs grow normal-case"
		on:click={() => {
			showQMSBody = !showQMSBody;
		}}>QMS body</button
	>
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
			argsInfo={currentQMS_Info?.args}
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
					<!-- svelte-ignore a11y-click-events-have-key-events -->
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
{#if showQMSBody}
	<div class="mockup-code bg-base text-content my-1 mx-2 px-2 ">
		<div class="max-h-32 overflow-y-auto">
			{#if showNonPrettifiedQMSBody}
				<code class="px-10">{$QMS_bodyPartsUnifier_StoreDerived}</code>
			{:else}
				<code class="px-10 ">{format($QMS_bodyPartsUnifier_StoreDerived)}</code>
			{/if}
		</div>
		<button
			class="btn btn-xs btn-accent mx-atuo absolute top-4 right-4 normal-case"
			on:click={() => {
				showNonPrettifiedQMSBody = !showNonPrettifiedQMSBody;
			}}
		>
			{showNonPrettifiedQMSBody ? ' show prettified ' : ' show non-prettified '}</button
		>
	</div>
{/if}

<div class="md:px-2">
	<Table
		{infiniteId}
		{infiniteHandler}
		colsData={$tableColsData_Store}
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
<div />
