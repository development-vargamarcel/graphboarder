<script lang="ts">
	import AddColumn from './AddColumn.svelte';
	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	import {
		generateTitleFromStepsOfFields,
		getDataGivenStepsOfFields,
		getFields_Grouped,
		getRootType
	} from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';
	import Type from '$lib/components/Type.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';
	import hljs from 'highlight.js/lib/core';
	import graphql from 'highlight.js/lib/languages/graphql';
	import { Logger } from '$lib/utils/logger';
	import 'highlight.js/styles/base16/solarized-dark.css';
	import RowCount from '$lib/components/UI/rowCount.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { browser } from '$app/environment';
	import TypeList from './TypeList.svelte';
	import CodeEditor from './fields/CodeEditor.svelte';
	import GraphqlCodeDisplay from './GraphqlCodeDisplay.svelte';

	interface Props {
		prefix?: string;
		QMSName: any;
		children?: import('svelte').Snippet;
	}

	let { prefix = '', QMSName, children }: Props = $props();

	// Get contexts - ensuring prefix is defined
	let context = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = context?.endpointInfo;
	const urqlCoreClient = context?.urqlCoreClient;
	let queryName = QMSName;
	const qmsContext = getContext<QMSWraperContext>('QMSWraperContext');
	const {
		QMS_bodyPart_StoreDerived_rowsCount = null,
		activeArgumentsDataGrouped_Store,
		tableColsData_Store,
		finalGqlArgObj_Store,
		QMS_bodyPart_StoreDerived,
		QMS_bodyPartsUnifier_StoreDerived,
		paginationOptions,
		paginationState
	} = qmsContext;
	const schemaData = context?.schemaData;

	let currentQMS_info = (schemaData as any).get_QMS_Field(queryName, 'query', schemaData as any);
	let dd_relatedRoot = getRootType(null, currentQMS_info.dd_rootName, schemaData as any);
	if (!currentQMS_info) {
		goto('/queries');
	}

	const paginationTypeInfo = get_paginationTypes(endpointInfo, schemaData as any).find((pagType: any) => {
		return pagType.name == currentQMS_info.dd_paginationType;
	});

	let { scalarFields } = getFields_Grouped(dd_relatedRoot, [], schemaData as any);

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
		Logger.info('Starting Query Execution', { queryBody });
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
					Logger.error('Query execution failed', result.error);
				}
				if (result.data) {
					data = result.data;
					Logger.info('Query execution successful', { dataCount: Array.isArray(data) ? data.length : 1 });
				}
				queryData = { fetching, error, data };
				let stepsOfFieldsInput = [
					currentQMS_info.dd_displayName,
					...endpointInfo.get_rowsLocation(currentQMS_info, schemaData as any)
				];
				Logger.debug({ stepsOfFieldsInput }, currentQMS_info.dd_displayName);
				rowsCurrent = getDataGivenStepsOfFields(undefined, queryData.data, stepsOfFieldsInput) as any[];
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
					Logger.debug('loadedF ');
				} else {
					completeF?.();
					Logger.debug('completeF');
				}

				Logger.debug({ rows }, { rowsCurrent });
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
				return rows.length / ($paginationState?.[argName] as number) >= 1;
			}) ||
			paginationTypeInfo?.name == 'pageBased'
		) {
			paginationState.nextPage(queryData?.data, queryName, 'query');
		} else {
			loaded();
			complete();
		}
	}

	const hideColumn = (e: { detail: { column: any } }) => {
		tableColsData_Store.removeColumn(e.detail.column);
	};

	// Effects - auto-cleanup on component destruction
	$effect(() => {
		Logger.debug('$QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
	});

	$effect(() => {
		activeArgumentsDataGrouped_Store_IS_SET = $activeArgumentsDataGrouped_Store.length > 0;
	});

	$effect(() => {
		const QMS_body = $QMS_bodyPartsUnifier_StoreDerived;
		if (QMS_body && QMS_body !== '') {
			runQuery(QMS_body);
		}
	});

	$effect(() => {
		Logger.debug({ queryData });
	});

	$effect(() => {
		Logger.debug($tableColsData_Store);
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

{@render children?.()}

<!-- <button
	on:click={() => {
		paginationState.nextPage(rows[rows.length - 1], queryData?.data);
	}}
>
	next page
</button> -->
<!-- main -->
<div class="flex space-x-2 mx-2 z-50">
	<AddColumn
		bind:column_stepsOfFields
		{dd_relatedRoot}
		QMSName={queryName}
		QMS_info={currentQMS_info}
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

	<button class="btn btn-xs btn-primary " aria-label="Add">
		<i class="bi bi-plus-circle-fill "></i>
	</button>
</div>

{@render children?.()}
{#if queryData.error}
	<div class="px-4 mx-auto  mb-2">
		<div class="alert alert-error shadow-lg ">
			<div>
				<button
					class="btn btn-ghost btn-sm p-0"
					onclick={() => {
						queryData.error = null;
					}}
					aria-label="Dismiss error"
				>
					<svg
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
		{infiniteId}
		{infiniteHandler}
		colsData={$tableColsData_Store}
		{rows}
		onHideColumn={(detail) => {
			hideColumn({ detail });
		}}
		onRowClicked={(detail) => {
			if (browser) {
				window.open(
					`${$page.url.origin}/endpoints/${detail.id}`,
					'_blank' // <- This is what makes it open in a new window.
				);
				//	window.location = `${$page.url.origin}/endpoints/${detail.id}`;
			}
			//goto(`${$page.url.origin}/endpoints/${detail.id}`);
		}}
	/>
</div>
<div></div>
