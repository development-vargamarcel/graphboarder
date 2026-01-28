<script lang="ts">
	interface Props {
		prefix?: string;
		children?: import('svelte').Snippet;
		QMSName?: string;
	}

	let { prefix = '', children, QMSName: _QMSName }: Props = $props();

	import AddColumn from '$lib/components/AddColumn.svelte';
	import { getContext, untrack } from 'svelte';
	import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';
	import { Logger } from '$lib/utils/logger';
	import { get } from 'svelte/store';

	// Get contexts - ensuring prefix is available
	let context = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	let endpointInfo = $derived(context?.endpointInfo);
	let schemaData = $derived(context?.schemaData);
	const urqlCoreClient = context?.urqlCoreClient;

	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';

	const qmsContext = getContext<QMSWraperContext>(`${untrack(() => prefix)}QMSWraperContext`);
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
	} = qmsContext;
	import {
		generateTitleFromStepsOfFields,
		getDataGivenStepsOfFields,
		getFields_Grouped,
		getRootType,
		stepsOfFieldsToQueryFragmentObject
	} from '$lib/utils/usefulFunctions';
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';

	let queryName = $derived(QMSName);

	let currentQMS_info = $derived(schemaData.get_QMS_Field(queryName, 'query', schemaData));
	let dd_relatedRoot = $derived(getRootType(null, currentQMS_info.dd_rootName, schemaData));

	$effect(() => {
		if (!currentQMS_info) {
			//	goto('/queries');
		}
	});

	$effect(() => {
		Logger.debug({ QMS_info });
	});

	$effect(() => {
		Logger.debug('$QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
	});
	$effect(() => {
		return () => {
			document.getElementById('my-drawer-3')?.click();
		};
	});

	//
	let activeArgumentsData = [];
	let paginationTypeInfo = $derived(get_paginationTypes(endpointInfo, schemaData).find((pagType) => {
		return pagType.name == QMS_info?.dd_paginationType;
	}));

	let activeArgumentsDataGrouped_Store_IS_SET = $state(false);
	$effect(() => {
		activeArgumentsDataGrouped_Store_IS_SET =
			$activeArgumentsDataGrouped_Store.length > 0 ? true : false;
	});
	//

	let scalarFields = $derived(getFields_Grouped(dd_relatedRoot, [], schemaData).scalarFields);

	let queryData: any = $state({});
	let rows = $state([]);
	let rowsCurrent: any = [];
	let loadedF;
	let completeF;
	let infiniteId = $state(Math.random());
	$effect(() => {
		Logger.debug({ infiniteId });
	});
	function infiniteHandler({ detail: { loaded, complete } }) {
		loadedF = loaded;
		completeF = complete;
		const rowLimitingArgNames = paginationTypeInfo?.get_rowLimitingArgNames(
			QMS_info.dd_paginationArgs
		);
		if (
			rowLimitingArgNames?.some((argName) => {
				return rows.length / ($paginationState?.[argName] as number) >= 1; //means that all previous pages contained nr of items == page items size
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
					...endpointInfo.get_rowsLocation(QMS_info, schemaData)
				];
				Logger.debug({ stepsOfFieldsInput }, QMS_info.dd_displayName);
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
					Logger.debug('loadedF ');
				} else {
					completeF && completeF();
					Logger.debug('completeF');
				}

				Logger.debug({ rows }, { rowsCurrent });
				rowsCurrent = [];
			});
	};
	$effect(() => {
		const QMS_body = $QMS_bodyPartsUnifier_StoreDerived;
		if (QMS_body && QMS_body !== '') {
			//runQuery(QMS_body);
		}
	});

	$effect(() => {
		Logger.debug({ queryData });
	});

	$effect(() => {
		if (scalarFields.length == 0) {
			queryData = { fetching: false, error: false, data: false };
		} else {
			queryData = { fetching: true, error: false, data: false };
		}
	});

	const hideColumn = (e) => {
		tableColsData_Store.removeColumn(e.detail.column);
	};

	$effect(() => {
		Logger.debug($tableColsData_Store);
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
	import TypeList from '$lib/components/TypeList.svelte';
	import CodeEditor from '$lib/components/fields/CodeEditor.svelte';
	import GraphqlCodeDisplay from '$lib/components/GraphqlCodeDisplay.svelte';

	$effect(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});
	let showModal = false;
	let showActiveFilters;
</script>

<div class=" h-full">
	<div class="  w-full   px-0 mb-10 ">
		<div class=" mt-2     space-y-2   pb-2  bg-base-100 rounded-box ">
			<div class="w-2"></div>
			<ActiveArguments />
			<div class="w-2"></div>

			<div class=" w-full p-2">
				<button
					class="btn btn-sm btn-primary  w-full"
					onclick={() => {
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
		<AddColumn
			bind:column_stepsOfFields
			{addColumnFromInput}
			{dd_relatedRoot}
			{QMSName}
			{QMS_info}
			onNewColumnAddRequest={(tableColData) => {
				tableColsData_Store.addColumn(tableColData);
			}}
		/>

		<button
			class=" btn btn-xs grow normal-case "
			onclick={() => {
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

	{@render children?.()}
	{#if queryData.error}
		<div class="px-4 mx-auto  mb-2">
			<div class="alert alert-error shadow-lg ">
				<div>
					<button
						class="btn btn-ghost btn-sm p-0"
						aria-label="Clear Error"
						onclick={() => {
							queryData.error = null;
						}}
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

	{#if queryData.data}
		<div class="md:px-2">
			<Table
				{infiniteId}
				{infiniteHandler}
				colsData={$tableColsData_Store}
				{rows}
				onHideColumn={(detail) => {
					hideColumn({ detail });
				}}
			/>
		</div>
	{/if}

	<div></div>
</div>
