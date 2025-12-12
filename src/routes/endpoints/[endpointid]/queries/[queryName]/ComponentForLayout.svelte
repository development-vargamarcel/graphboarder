<script lang="ts">
	import CodeEditor from '$lib/components/fields/CodeEditor.svelte';
	import AddColumn from './../../../../../lib/components/AddColumn.svelte';
	import TypeList from './../../../../../lib/components/TypeList.svelte';
	import Table from '$lib/components/Table.svelte';
	import { page } from '$app/stores';
	import {
		generateTitleFromStepsOfFields,
		getDataGivenStepsOfFields,
		getFields_Grouped,
		getRootType,
		stepsOfFieldsToQueryFragmentObject
	} from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';
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
		rowSelectionState?: any;
		onRowSelectionChange?: (detail: any) => void;
		onRowClicked?: (detail: any) => void;
		children?: import('svelte').Snippet;
	}

	let {
		prefix = '',
		enableMultiRowSelectionState = true,
		currentQMS_info: currentQMS_infoProp,
		rowSelectionState,
		onRowSelectionChange,
		onRowClicked,
		children
	}: Props = $props();

	// Get contexts
	let QMSMainWraperContext = getContext<any>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	const urqlCoreClient = QMSMainWraperContext?.urqlCoreClient;

	const QMSWraperContext = getContext<any>(`${prefix}QMSWraperContext`);
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

	// Initialize currentQMS_info from prop or context
	let currentQMS_info = currentQMS_infoProp ?? schemaData.get_QMS_Field(QMSName, 'query', schemaData);

	console.log({ QMS_bodyPart_StoreDerived_rowsCount }, { QMSWraperContext });

	let dd_relatedRoot = getRootType(null, currentQMS_info.dd_rootName, schemaData);
	if (!currentQMS_info) {
		goto('/queries');
	}

	// Pagination setup
	const paginationTypeInfo = get_paginationTypes(endpointInfo, schemaData).find((pagType) => {
		return pagType.name == currentQMS_info.dd_paginationType;
	});

	let { scalarFields } = getFields_Grouped(dd_relatedRoot, [], schemaData);

	// Reactive state
	let queryData = $state<{ fetching: boolean; error: any; data: any }>(
		scalarFields.length == 0
			? { fetching: false, error: false, data: false }
			: { fetching: true, error: false, data: false }
	);
	let rows = $state<any[]>([]);
	let rowsCurrent: any[] = [];
	let loadedF: (() => void) | undefined;
	let completeF: (() => void) | undefined;
	let infiniteId = $state(Math.random());
	let activeArgumentsDataGrouped_Store_IS_SET = $state(false);
	let column_stepsOfFields = $state('');
	let showQMSBody = $state(false);
	let showNonPrettifiedQMSBody = false;
	let showModal = $state(false);
	let showActiveFilters: boolean | undefined;

	// Query execution function
	const runQuery = (queryBody: string) => {
		let fetching = true;
		let error: any = false;
		let data: any = false;
		$urqlCoreClient
			.query(queryBody)
			.toPromise()
			.then((result: any) => {
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
							.some((argName: string) => {
								return rowsCurrent?.length == $paginationState?.[argName];
							})) ||
					paginationTypeInfo?.name == 'pageBased'
				) {
					loadedF?.();
					console.log('loadedF ');
				} else {
					completeF?.();
					console.log('completeF');
				}

				console.log({ rows }, { rowsCurrent });
				rowsCurrent = [];
			});
	};

	function infiniteHandler({ detail: { loaded, complete } }: { detail: { loaded: () => void; complete: () => void } }) {
		loadedF = loaded;
		completeF = complete;
		const rowLimitingArgNames = paginationTypeInfo?.get_rowLimitingArgNames(
			currentQMS_info.dd_paginationArgs
		);
		if (
			rowLimitingArgNames?.some((argName: string) => {
				return rows.length / $paginationState?.[argName] >= 1;
			}) ||
			paginationTypeInfo?.name == 'pageBased'
		) {
			paginationState.nextPage(queryData?.data, QMSName, 'query');
		} else {
			loaded();
			complete();
		}
	}

	const hideColumn = (e: { detail: { column: any } }) => {
		console.log('hideColumn', e.detail.column);
		tableColsData_Store.removeColumn(e.detail.column);
	};

	const addColumnFromInput = (e: KeyboardEvent) => {
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

	// Effects - auto-cleanup on component destruction
	$effect(() => {
		console.log('$QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
	});

	$effect(() => {
		console.log({
			QMSWraperContext,
			activeArgumentsDataGrouped: $activeArgumentsDataGrouped_Store
		});
		activeArgumentsDataGrouped_Store_IS_SET = $activeArgumentsDataGrouped_Store.length > 0;
	});

	$effect(() => {
		const QMS_body = $QMS_bodyPartsUnifier_StoreDerived;
		if (QMS_body && QMS_body !== '') {
			runQuery(QMS_body);
		}
	});

	$effect(() => {
		console.log({ queryData });
	});

	$effect(() => {
		console.log($tableColsData_Store);
	});

	// Cleanup drawer on destroy
	$effect(() => {
		return () => {
			document.getElementById('my-drawer-3')?.click();
		};
	});

	// Initialize hljs on mount
	$effect(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});
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
		onNewColumnAddRequest={(tableColData) => {
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
		onNewColumnAddRequest={(tableColData) => {
			console.log('aaaaaaaaa', { tableColData });
			tableColsData_Store.addColumn(tableColData);
		}}
	/>
	<div class="grow==">
		{#if showModal}
			<Modal
				modalIdetifier={'activeArgumentsDataModal'}
				showApplyBtn={false}
				onCancel={(detail) => {
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
	<GraphqlCodeDisplay {showNonPrettifiedQMSBody} {prefix} value={$QMS_bodyPartsUnifier_StoreDerived} />
{/if}

<div class="md:px-2">
	<Table
		{rowSelectionState}
		{enableMultiRowSelectionState}
		{infiniteId}
		{infiniteHandler}
		colsData={$tableColsData_Store}
		{rows}
		onHideColumn={(detail) => {
			hideColumn({ detail });
		}}
		{onRowSelectionChange}
		{onRowClicked}
	/>
</div>
