<script lang="ts">
	import { run } from 'svelte/legacy';

	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	import {
		generateTitleFromStepsOfFields,
		getDataGivenStepsOfFields,
		getFields_Grouped,
		getRootType,
		stringToJs
	} from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount, getContext, setContext } from 'svelte';
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
	import { parseAll, stigifyAll } from '$lib/stores/testData/testEndpoints';
	import MainWraper from './MainWraper.svelte';
	import Sidebar from './Sidebar.svelte';

	interface Props {
		prefix?: string;
		QMSName: any;
		children?: import('svelte').Snippet;
	}

	let { prefix = '', QMSName, children }: Props = $props();

	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const urqlCoreClient = QMSMainWraperContext?.urqlCoreClient;
	let queryName = QMSName;
	const QMSWraperContext = getContext('QMSWraperContext');
	const {
		QMS_bodyPart_StoreDerived_rowsCount = null,
		activeArgumentsDataGrouped_Store,
		tableColsData_Store,
		finalGqlArgObj_Store,
		QMS_bodyPart_StoreDerived,
		QMS_bodyPartsUnifier_StoreDerived,
		paginationOptions,
		paginationState
	} = QMSWraperContext;
	const schemaData = QMSMainWraperContext?.schemaData;

	run(() => {
		console.log('$QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
	});
	onDestroy(() => {
		document.getElementById('my-drawer-3')?.click();
	});

	let currentQMS_info = schemaData.get_QMS_Field(queryName, 'query', schemaData);
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
		activeArgumentsDataGrouped_Store_IS_SET =
			$activeArgumentsDataGrouped_Store.length > 0 ? true : false;
	});
	//

	let { scalarFields } = getFields_Grouped(dd_relatedRoot, [], schemaData);

	let queryData = $state();
	let rows = [];
	let rowsCurrent = [];
	let loadedF;
	let completeF;
	let infiniteId = Math.random();
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
			paginationState.nextPage(queryData?.data, queryName, 'query');
		} else {
			loaded();
			complete();
		}
		// if (rows.length > 0) {
		// 	paginationState.nextPage(queryData?.data, queryName, 'query');
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

	//Active arguments logic
	let showQMSBody = false;
	let showNonPrettifiedQMSBody = false;

	onMount(() => {
		hljs.registerLanguage('graphql', graphql);
		hljs.highlightAll();
	});
	let showModal = false;
	let showActiveFilters;

	let endpointConfiguration = $state();

	run(() => {
		if (queryData?.data) {
			const configurationText = getDataGivenStepsOfFields(null, queryData, [
				'data',
				'endpoints_by_pk',
				'extraConfig'
			]);
			const configTemplate = getDataGivenStepsOfFields(null, queryData, [
				'data',
				'endpoints_by_pk',
				'configuration',
				'configuration'
			]);

			console.log({ configurationText });
			console.log({ configTemplate });

			endpointConfiguration = stringToJs(configurationText);

			if (configTemplate) {
				endpointConfiguration = { ...stringToJs(configTemplate), ...endpointConfiguration };
			}
			console.log({ endpointConfiguration });
		}
	});

	let forceVisibleSidebar = $state(false);
</script>

{#if endpointConfiguration}
	<MainWraper endpointInfoProvided={endpointConfiguration}>
		<main class="bg-base-300  flex w-[100vw] overflow-hidden">
			<div class="  md:max-w-[300px]">
				<Sidebar bind:forceVisibleSidebar />
			</div>
			<div class="flex flex-col w-full md:w-[65vw]   grow h-screen">
				<div class=" bg-base-100 min-h-[50px] flex">
					<label
						class="btn btn-square btn-ghost  md:hidden"
						onclick={() => {
							forceVisibleSidebar = true;
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block w-6 h-6 stroke-current "
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/></svg
						>
					</label>
					<div></div>
				</div>
				{@render children?.()}
			</div>
		</main>
	</MainWraper>
{/if}
