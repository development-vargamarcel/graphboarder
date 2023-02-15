<script>
	import { endpointInfo } from '$lib/stores/endpointHandling/endpointInfo';
	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	import { urqlCoreClient } from '$lib/utils/urqlCoreClient';
	export let prefix = '';

	const QMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	const {
		QMS_bodyPart_StoreDerived_rowsCount = null,
		activeArgumentsDataGrouped_Store,
		tableColsData_Store,
		finalGqlArgObj_Store,
		QMS_bodyPart_StoreDerived,
		QMS_bodyPartsUnifier_StoreDerived,
		paginationOptions,
		paginationState,
		QMS_info,
		QMSType,
		QMSName
	} = QMSWraperContext;
	console.log({ QMS_info });
	import {
		generateTitleFromStepsOfFields,
		getDataGivenStepsOfFields,
		getFields_Grouped,
		getRootType
	} from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount, getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { schemaData } from '$lib/stores/endpointHandling/schemaData';
	import { paginationTypes } from '$lib/stores/pagination/paginationTypes';

	$: console.log('$QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
	onDestroy(() => {
		document.getElementById('my-drawer-3')?.click();
	});

	let dd_relatedRoot = getRootType(null, QMS_info.dd_rootName);
	if (!QMS_info) {
		//	goto('/queries');
	}
	//
	let activeArgumentsData = [];
	const paginationTypeInfo = paginationTypes.find((pagType) => {
		return pagType.name == QMS_info?.dd_paginationType;
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
	console.log({ infiniteId });
	function infiniteHandler({ detail: { loaded, complete } }) {
		loadedF = loaded;
		completeF = complete;
		const rowLimitingArgNames = paginationTypeInfo?.get_rowLimitingArgNames(
			QMS_info.dd_paginationArgs
		);
		if (
			rowLimitingArgNames?.some((argName) => {
				return rows.length / $paginationState?.[argName] >= 1; //means that all previous pages contained nr of items == page items size
			}) ||
			paginationTypeInfo?.name == 'pageBased'
		) {
			paginationState.nextPage(queryData?.data, QMSName, 'query');
		} else {
			loaded();
			complete();
		}
		// if (rows.length > 0) {
		// 	paginationState.nextPage(queryData?.data, QMSName, 'query');
		// }
	}
	const runQuery = (queryBody) => {
		let fetching = true;
		let error = false;
		let data = false;
		$urqlCoreClient
			.mutation(queryBody)
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
				let stepsOfFieldsInput = [
					QMS_info.dd_displayName,
					...endpointInfo.get_rowsLocation(QMS_info)
				];
				console.log({ stepsOfFieldsInput }, QMS_info.dd_displayName);
				rowsCurrent = getDataGivenStepsOfFields(undefined, queryData.data, stepsOfFieldsInput);
				if (rowsCurrent && !Array.isArray(rowsCurrent)) {
					rowsCurrent = [rowsCurrent];
				}
				if ($paginationOptions.infiniteScroll) {
					if (
						paginationTypeInfo?.isFirstPage(paginationState, QMS_info.dd_paginationArgs) &&
						rowsCurrent?.length > 0
					) {
						infiniteId += 1;
						rows = [...rowsCurrent];
					} else {
						if (rowsCurrent?.[0] != undefined) {
							rows = [...rows, ...rowsCurrent];
						}
						if (
							paginationTypeInfo?.isFirstPage(paginationState, QMS_info.dd_paginationArgs) &&
							rowsCurrent?.length == 0
						) {
							rows = rowsCurrent;
						}
					}
				} else {
					rows = rowsCurrent;
				}
				if (
					(paginationTypeInfo?.get_rowLimitingArgNames(QMS_info.dd_paginationArgs).length > 0 &&
						paginationTypeInfo
							?.get_rowLimitingArgNames(QMS_info.dd_paginationArgs)
							.some((argName) => {
								return rowsCurrent?.length == $paginationState?.[argName];
							})) ||
					paginationTypeInfo?.name == 'pageBased'
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
	QMS_bodyPartsUnifier_StoreDerived.subscribe((QMS_body) => {
		if (QMS_body && QMS_body !== '') {
			//runQuery(QMS_body);
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
				title: `col-${Math.floor(Math.random() * 200)},${generateTitleFromStepsOfFields(
					stepsOfFields
				)}`,
				stepsOfFields: [QMSName, ...stepsOfFields]
			};

			tableColsData_Store.addColumn(tableColData);
			column_stepsOfFields = '';
		}
	};

	//Active arguments logic
	let showQMSBody = false;
	let showNonPrettifiedQMSBody = false;
	import { format } from 'graphql-formatter';
	import hljs from 'highlight.js/lib/core';
	import graphql from 'highlight.js/lib/languages/graphql';
	import 'highlight.js/styles/base16/solarized-dark.css';
	import RowCount from '$lib/components/UI/rowCount.svelte';
	import Modal from '$lib/components/Modal.svelte';

	onMount(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});
	let showModal = false;
	let showActiveFilters;
</script>

<div class=" h-full">
	<div class="  w-full   px-6 mb-10 ">
		<div class=" mt-2     space-y-2   pb-2  bg-base-100 rounded-box ">
			<div class="w-2" />
			<ActiveArguments />
			<div class="w-2" />

			<div class=" w-full p-2">
				<button
					class="btn btn-sm btn-primary  w-full"
					on:click={() => {
						let mutationBody = $QMS_bodyPartsUnifier_StoreDerived;
						if (mutationBody && mutationBody !== '') {
							runQuery(mutationBody);
						}
					}}>submit</button
				>
			</div>
		</div>
	</div>
	<div class="flex space-x-2 mx-2">
		<div class="dropdown grow ">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<label tabindex="0" class="btn btn-xs bi bi-node-plus-fill text-lg p-1  w-full" />
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<div
				tabindex="0"
				class="dropdown-content menu p-2  bg-base-100 rounded-box ==w-max max-w-screen text-sm shadow-2xl"
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
						{#if dd_relatedRoot?.fields}
							{#each dd_relatedRoot.fields as type, index (index)}
								<Type
									{index}
									{type}
									template="columnAddDisplay"
									stepsOfFields={[QMSName]}
									depth={0}
								/>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>

		<button
			class=" btn btn-xs grow normal-case "
			on:click={() => {
				showQMSBody = !showQMSBody;
			}}>QMS body</button
		>
		{#if QMS_bodyPart_StoreDerived_rowsCount}
			<div class="badge badge-primary flex space-x-2">
				{rows.length}/
				<RowCount QMS_bodyPart_StoreDerived={QMS_bodyPart_StoreDerived_rowsCount} {QMS_info} />
			</div>
		{/if}
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
		<div class="mockup-code== bg-base text-content my-1 mx-2 px-2 relative">
			<div class="max-h-32 overflow-y-auto">
				{#if showNonPrettifiedQMSBody}
					<code class="px-10">{$QMS_bodyPartsUnifier_StoreDerived}</code>
				{:else}
					<code class="language-graphql "
						>{@html hljs
							.highlight(format($QMS_bodyPartsUnifier_StoreDerived), { language: 'graphql' })
							.value.trim()}</code
					>
				{/if}
			</div>
			<button
				class="btn btn-xs btn-accent mx-atuo absolute top-3 right-4 normal-case"
				on:click={() => {
					showNonPrettifiedQMSBody = !showNonPrettifiedQMSBody;
				}}
			>
				{showNonPrettifiedQMSBody ? ' show prettified ' : ' show non-prettified '}</button
			>
		</div>
	{/if}

	{#if queryData.data}
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
	{/if}

	<div />
</div>
