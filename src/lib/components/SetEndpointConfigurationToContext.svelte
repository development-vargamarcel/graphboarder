<script lang="ts">
	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	import {
		generateTitleFromStepsOfFields,
		getDataGivenStepsOfFields,
		getFields_Grouped,
		getRootType,
		stringToJs
	} from '$lib/utils/usefulFunctions';
	import { getContext, setContext } from 'svelte';
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

	// Get contexts
	let QMSMainWraperContext = getContext<any>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const urqlCoreClient = QMSMainWraperContext?.urqlCoreClient;
	let queryName = QMSName;
	const QMSWraperContext = getContext<any>('QMSWraperContext');
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

	let currentQMS_info = schemaData.get_QMS_Field(queryName, 'query', schemaData);
	let dd_relatedRoot = getRootType(null, currentQMS_info.dd_rootName, schemaData);
	if (!currentQMS_info) {
		goto('/queries');
	}

	const paginationTypeInfo = get_paginationTypes(endpointInfo, schemaData).find((pagType: any) => {
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
	let endpointConfiguration = $state<any>();
	let forceVisibleSidebar = $state(false);

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
		console.log('$QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
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
		console.log($tableColsData_Store);
	});

	$effect(() => {
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
