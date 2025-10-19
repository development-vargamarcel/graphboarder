<script lang="ts">
	import { run } from 'svelte/legacy';

	import CodeEditor from '$lib/components/fields/CodeEditor.svelte';
	import AddColumn from './../../../../../lib/components/AddColumn.svelte';
	import TypeList from './../../../../../lib/components/TypeList.svelte';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	const dispatch = createEventDispatcher();
	const urqlCoreClient = QMSMainWraperContext?.urqlCoreClient;
	/// if CPContext,QMSWraperContext will be relative to that

	///
	const QMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	const {
		QMS_bodyPart_StoreDerived_rowsCount,
		activeArgumentsDataGrouped_Store,
		tableColsData_Store,
		finalGqlArgObj_Store,
		QMS_bodyPart_StoreDerived,
		QMS_bodyPartsUnifier_StoreDerived,
		paginationOptions,
		paginationState,
		QMSName
	} = QMSWraperContext;
	console.log({ QMS_bodyPart_StoreDerived_rowsCount }, { QMSWraperContext });
	import {
		generateTitleFromStepsOfFields,
		getDataGivenStepsOfFields,
		getFields_Grouped,
		getRootType,
		stepsOfFieldsToQueryFragmentObject
	} from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount, getContext, createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';

	run(() => {
		console.log('$QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
	});
	onDestroy(() => {
		document.getElementById('my-drawer-3')?.click();
	});

	let dd_relatedRoot = getRootType(null, currentQMS_info.dd_rootName, schemaData);
	if (!currentQMS_info) {
		goto('/queries');
	}
	//
	let activeArgumentsData = [];
	const paginationTypeInfo = get_paginationTypes(endpointInfo, schemaData).find((pagType) => {
		return pagType.name == currentQMS_info.dd_paginationType;
	});
	let activeArgumentsDataGrouped_Store_IS_SET = $state(false);
	run(() => {
		console.log({
			QMSWraperContext,
			$activeArgumentsDataGrouped_Store
		});

		activeArgumentsDataGrouped_Store_IS_SET =
			$activeArgumentsDataGrouped_Store.length > 0 ? true : false;
	});
	//
	let { scalarFields } = getFields_Grouped(dd_relatedRoot, [], schemaData);

	let queryData = $state();
	let rows = $state([]);
	let rowsCurrent = [];
	let loadedF;
	let completeF;
	let infiniteId = $state(Math.random());
	function infiniteHandler({ detail: { loaded, complete } }) {
		loadedF = loaded;
		completeF = complete;
		const rowLimitingArgNames = paginationTypeInfo?.get_rowLimitingArgNames(
			currentQMS_info.dd_paginationArgs
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
				let stepsOfFieldsInput = [
					currentQMS_info.dd_displayName,
					...endpointInfo.get_rowsLocation(currentQMS_info, schemaData)
				];
				console.log({ stepsOfFieldsInput }, currentQMS_info.dd_displayName);
				rowsCurrent = getDataGivenStepsOfFields(undefined, queryData.data, stepsOfFieldsInput);
				if (rowsCurrent && !Array.isArray(rowsCurrent)) {
					rowsCurrent = [rowsCurrent];
				}
				if ($paginationOptions.infiniteScroll) {
					if (
						paginationTypeInfo?.isFirstPage(paginationState, currentQMS_info.dd_paginationArgs) &&
						rowsCurrent?.length > 0
					) {
						infiniteId += 1;
						rows = [...rowsCurrent];
					} else {
						if (rowsCurrent?.[0] != undefined) {
							rows = [...rows, ...rowsCurrent];
						}
						if (
							paginationTypeInfo?.isFirstPage(paginationState, currentQMS_info.dd_paginationArgs) &&
							rowsCurrent?.length == 0
						) {
							rows = rowsCurrent;
						}
					}
				} else {
					rows = rowsCurrent;
				}
				if (
					(paginationTypeInfo?.get_rowLimitingArgNames(currentQMS_info.dd_paginationArgs).length >
						0 &&
						paginationTypeInfo
							?.get_rowLimitingArgNames(currentQMS_info.dd_paginationArgs)
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
			runQuery(QMS_body);
		}
	});

	run(() => {
		console.log({ queryData });
	});
	if (scalarFields.length == 0) {
		queryData = { fetching: false, error: false, data: false };
	} else {
		queryData = { fetching: true, error: false, data: false };
	}

	const hideColumn = (e) => {
		console.log('hideColumn', e.detail.column);
		tableColsData_Store.removeColumn(e.detail.column);
	};
	tableColsData_Store.subscribe((data) => {
		console.log(data);
	});

	let column_stepsOfFields = $state('');
	const addColumnFromInput = (e) => {
		if (e.key == 'Enter') {
			let stepsOfFields = column_stepsOfFields.replace(/\s/g, '').replace(/\./g, '>').split('>');
			let tableColData = {
				title: `col-${Math.floor(Math.random() * 200)},${generateTitleFromStepsOfFields(
					stepsOfFields
				)}`,
				stepsOfFields: [QMSName, ...stepsOfFields],
				stepsOfFieldsOBJ: stepsOfFieldsToQueryFragmentObject([QMSName, ...stepsOfFields], false)
			};

			tableColsData_Store.addColumn(tableColData);
			column_stepsOfFields = '';
		}
	};

	//Active arguments logic
	let showQMSBody = $state(false);
	let showNonPrettifiedQMSBody = false;
	import { format } from 'graphql-formatter';
	import hljs from 'highlight.js/lib/core';
	import graphql from 'highlight.js/lib/languages/graphql';
	import 'highlight.js/styles/base16/solarized-dark.css';
	import RowCount from '$lib/components/UI/rowCount.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import GraphqlCodeDisplay from '$lib/components/GraphqlCodeDisplay.svelte';
	import ControlPanel from '$lib/components/ControlPanel.svelte';
	interface Props {
		prefix?: string;
		enableMultiRowSelectionState?: boolean;
		currentQMS_info?: any;
		rowSelectionState: any;
		children?: import('svelte').Snippet;
	}

	let {
		prefix = '',
		enableMultiRowSelectionState = true,
		currentQMS_info = schemaData.get_QMS_Field(QMSName, 'query', schemaData),
		rowSelectionState,
		children
	}: Props = $props();

	onMount(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});
	let showModal = $state(false);
	let showActiveFilters;
</script>

<!-- <button
	on:click={() => {
		paginationState.nextPage(rows[rows.length - 1], queryData?.data);
	}}
>
	next page
</button> -->
<!-- main -->
<div class="p-2">
	<ControlPanel
		type={currentQMS_info}
		bind:column_stepsOfFields
		{addColumnFromInput}
		{dd_relatedRoot}
		{QMSName}
		{currentQMS_info}
		on:newColumnAddRequest={(e) => {
			const tableColData = e.detail;
			console.log('aaaaaaaaa', { tableColData });
			tableColsData_Store.addColumn(tableColData);
		}}
	/>
</div>
<div class="flex space-x-2 mx-2">
	<AddColumn
		bind:column_stepsOfFields
		{addColumnFromInput}
		{dd_relatedRoot}
		{QMSName}
		QMS_info={currentQMS_info}
		on:newColumnAddRequest={(e) => {
			const tableColData = e.detail;
			console.log('aaaaaaaaa', { tableColData });
			tableColsData_Store.addColumn(tableColData);
		}}
	/>
	<div class="grow==">
		{#if showModal}
			<Modal
				modalIdetifier={'activeArgumentsDataModal'}
				showApplyBtn={false}
				on:cancel={(e) => {
					let { detail } = e;
					if (detail.modalIdetifier == 'activeArgumentsDataModal') {
						showModal = false;
					}
				}}
				><div class="  w-full  ">
					<div class="mx-auto mt-2  w-full   space-y-2   pb-2  ">
						<div class="w-2"></div>
						<ActiveArguments />
						<div class="w-2"></div>
					</div>
				</div>
			</Modal>
		{/if}

		<!-- <div class="flex space-x-2 mb-2 px-2">
			<button
				class="btn btn-xs btn-block  "
				on:click={() => {
					showModal = !showModal;
					//showActiveFilters = !showActiveFilters;
					showActiveFilters = true;
				}}
				><i class="bi bi-funnel-fill" />
			</button>
		</div> -->
	</div>
	<button
		class=" btn btn-xs grow normal-case "
		onclick={() => {
			showQMSBody = !showQMSBody;
		}}>QMS body</button
	>
	{#if QMS_bodyPart_StoreDerived_rowsCount}
		<div class="badge badge-primary flex space-x-2">
			{rows.length}/
			<RowCount
				QMS_bodyPart_StoreDerived={QMS_bodyPart_StoreDerived_rowsCount}
				QMS_info={currentQMS_info}
			/>
		</div>
	{/if}
	<button class="btn btn-xs btn-primary ">
		<i class="bi bi-plus-circle-fill "></i>
	</button>
</div>

{@render children?.()}
{#if queryData.error}
	<div class="px-4 mx-auto  mb-2">
		<div class="alert alert-error shadow-lg ">
			<div>
				<button class="btn btn-ghost btn-sm p-0">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<svg
						onclick={() => {
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
	<GraphqlCodeDisplay {showNonPrettifiedQMSBody} value={$QMS_bodyPartsUnifier_StoreDerived} />
{/if}

<div class="md:px-2">
	<Table
		{rowSelectionState}
		{enableMultiRowSelectionState}
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
		on:rowSelectionChange
		on:rowClicked
	/>
</div>
