<script>
	import { run } from 'svelte/legacy';

	import { Create_paginationOptions } from '$lib/stores/pagination/paginationOptions';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import { Create_finalGqlArgObj_Store } from '$lib/stores/QMSHandling/finalGqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/QMSHandling/tableColsData_Store';
	import { Create_QMS_bodyPart_StoreDerived } from '$lib/stores/QMSHandling/QMS_bodyPart_StoreDerived';
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import { Create_QMS_bodyPartsUnifier_StoreDerived } from '$lib/stores/QMSHandling/QMS_bodyPartsUnifier_StoreDerived';
	import { Create_paginationState } from '$lib/stores/QMSHandling/paginationState';
	import { Create_paginationState_derived } from '$lib/stores/QMSHandling/paginationState_derived';
	import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';
	import {
		get_scalarColsData,
		get_nodeFieldsQMS_info,
		getDeepField
	} from '$lib/utils/usefulFunctions';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	import { get, writable } from 'svelte/store';
	import { Create_mergedChildren_finalGqlArgObj_Store } from '$lib/stores/QMSHandling/mergedChildren_finalGqlArgObj_Store';
	//import { Create_mergedChildren_activeArgumentsDataGrouped_Store } from '$lib/stores/QMSHandling/mergedChildren_activeArgumentsDataGrouped_Store';
	import { Create_mergedChildren_QMSWraperCtxData_Store } from '$lib/stores/QMSHandling/mergedChildren_QMSWraperCtxData_Store';
	import { Create_mergedChildren_controlPanel_Store } from '$lib/stores/QMSHandling/mergedChildren_controlPanel_Store';
	import QMSWraperCtxDataCurrentComputations from './QMSWraperCtxDataCurrentComputations.svelte';
	import { Create_QMSFieldToQMSGetMany_Store } from '$lib/stores/QMSFieldToQMSGetMany_Store';
	if (!QMS_info) {
		QMS_info = schemaData.get_QMS_Field(QMSName, QMSType, schemaData);
	}
	const dd_paginationType = QMS_info?.dd_paginationType;
	let paginationTypeInfo;
	if (dd_paginationType) {
		paginationTypeInfo = get_paginationTypes(endpointInfo, schemaData).find((pagType) => {
			//console.log({ QMS_info }, { dd_paginationType });
			return pagType.name == dd_paginationType;
		});
	}
	console.log({ QMSType, QMSName, QMS_info });
	const paginationOptions = Create_paginationOptions();
	const paginationState = Create_paginationState(
		undefined,
		QMS_info.dd_paginationArgs,
		QMS_info.dd_paginationType,
		endpointInfo,
		schemaData
	);
	const paginationState_derived = Create_paginationState_derived(
		paginationState,
		QMS_info.dd_paginationArgs,
		QMS_info.dd_paginationType,
		endpointInfo,
		schemaData
	);

	const rowsLocation = endpointInfo.get_rowsLocation(QMS_info, schemaData);
	const nodeFieldsQMS_info = get_nodeFieldsQMS_info(QMS_info, rowsLocation, schemaData);
	// let scalarColsData = get_scalarColsData(
	// 	nodeFieldsQMS_info,
	// 	[QMS_info.dd_displayName, ...rowsLocation],
	// 	schemaData
	// );
	console.log({ nodeFieldsQMS_info });
	let returningColumnsLocationQMS_Info;
	//!! todo:before getting returningColumnsLocation value,you should check if it is a query or a mutation,and handle it accordingly
	let returningColumnsLocation;
	if (QMSType == 'query') {
		returningColumnsLocation = $endpointInfo.returningColumnsPossibleLocationsInQueriesPerRow.find(
			(path) => {
				returningColumnsLocationQMS_Info = getDeepField(
					nodeFieldsQMS_info,
					path,
					schemaData,
					'fields'
				);
				return returningColumnsLocationQMS_Info;
			}
		);
	} else {
		returningColumnsLocation = $endpointInfo.returningColumnsPossibleLocationsInMutations.find(
			(path) => {
				returningColumnsLocationQMS_Info = getDeepField(
					nodeFieldsQMS_info,
					path,
					schemaData,
					'fields'
				);
				return returningColumnsLocationQMS_Info;
			}
		);
	}
	console.log({ returningColumnsLocationQMS_Info, returningColumnsLocation, QMSType });
	let nodeFieldsQMS_info_Root = schemaData.get_rootType(
		null,
		nodeFieldsQMS_info?.dd_rootName,
		schemaData
	);

	let prefixStepsOfFields =
		QMSType == 'query'
			? [QMS_info.dd_displayName, ...rowsLocation, ...returningColumnsLocation]
			: [QMS_info.dd_displayName, ...returningColumnsLocation];
	let scalarColsData = get_scalarColsData(
		returningColumnsLocationQMS_Info,
		prefixStepsOfFields,
		schemaData
	);
	const dependencyColsData = paginationTypeInfo?.get_dependencyColsData(
		QMSName,
		'query',
		schemaData
	);
	tableColsData_StoreInitialValue = [
		...scalarColsData,
		...tableColsData_StoreInitialValue,
		...dependencyColsData
	];
	console.log({
		QMSType,
		QMSName,
		QMS_info,
		schemaData,
		nodeFieldsQMS_info,
		nodeFieldsQMS_info_Root,
		returningColumnsLocation,
		returningColumnsLocationQMS_Info,
		prefixStepsOfFields,
		scalarColsData,
		dependencyColsData,
		tableColsData_StoreInitialValue
	});
	const tableColsData_Store = Create_tableColsData_Store(
		paginationState,
		tableColsData_StoreInitialValue
	);

	const mergedChildren_finalGqlArgObj_Store = Create_mergedChildren_finalGqlArgObj_Store({});
	// const mergedChildren_activeArgumentsDataGrouped_Store =
	// 	Create_mergedChildren_activeArgumentsDataGrouped_Store({});
	const mergedChildren_QMSWraperCtxData_Store = Create_mergedChildren_QMSWraperCtxData_Store([]);
	const mergedChildren_controlPanel_Store = Create_mergedChildren_controlPanel_Store([]);
	const QMSFieldToQMSGetMany_Store = Create_QMSFieldToQMSGetMany_Store([]);

	run(() => {
		console.log('$QMSFieldToQMSGetMany_Store ', $QMSFieldToQMSGetMany_Store);
	});
	import JSON5 from 'json5';

	run(() => {
		console.log(
			'$mergedChildren_finalGqlArgObj_Store',
			'\n',
			$mergedChildren_finalGqlArgObj_Store,
			JSON5.stringify($mergedChildren_finalGqlArgObj_Store, { quote: '"' })
		);
	});
	// $: console.log(
	// 	'$mergedChildren_activeArgumentsDataGrouped_Store',
	// 	$mergedChildren_activeArgumentsDataGrouped_Store
	// );
	run(() => {
		console.log('$mergedChildren_QMSWraperCtxData_Store ', $mergedChildren_QMSWraperCtxData_Store);
	});
	run(() => {
		console.log('$mergedChildren_controlPanel_Store ', $mergedChildren_controlPanel_Store);
	});

	const QMS_bodyPart_StoreDerived = Create_QMS_bodyPart_StoreDerived(
		finalGqlArgObj_Store,
		tableColsData_Store,
		QMSType,
		QMSName,
		paginationOptions,
		paginationState_derived,
		mergedChildren_finalGqlArgObj_Store,
		initialGqlArgObj
	);

	const QMS_bodyPartsUnifier_StoreDerived = Create_QMS_bodyPartsUnifier_StoreDerived(
		[QMS_bodyPart_StoreDerived],
		QMSType
	);
	console.log('QMS_bodyPartsUnifier_StoreDerived', QMS_bodyPartsUnifier_StoreDerived);
	let QMS_bodyPart_StoreDerived_rowsCount = null;
	console.log(schemaData);
	const rowCountLocation = endpointInfo.get_rowCountLocation(QMS_info, schemaData);
	console.log({ rowCountLocation }, $endpointInfo);
	if (rowCountLocation) {
		const tableColsData_Store_rowsCount = writable([
			{ stepsOfFields: rowCountLocation, title: 'count' }
		]);

		QMS_bodyPart_StoreDerived_rowsCount = Create_QMS_bodyPart_StoreDerived(
			finalGqlArgObj_Store,
			tableColsData_Store_rowsCount,
			QMSType,
			rowCountLocation[0],
			paginationOptions,
			paginationState_derived,
			mergedChildren_finalGqlArgObj_Store,
			{}
		);
	}

	//
	// console.log('get_idField', endpointInfo.get_idField(QMS_info, schemaData));
	//
	//set to QMSWraperContext
	const tableName = endpointInfo.get_tableName(QMS_info, schemaData);
	console.log({ tableName });
	const thisContext = endpointInfo.get_thisContext();
	console.log({ thisContext });
	const objective = 'getOne';
	const qmsNameForObjective = endpointInfo.get_qmsNameForObjective(QMS_info, schemaData, objective);
	console.log({ qmsNameForObjective }, objective);
	let idColName = endpointInfo.get_idField(
		returningColumnsLocationQMS_Info || QMS_info,
		schemaData
	)?.dd_displayName;

	run(() => {
		console.log('$paginationState', $paginationState);
	});
	run(() => {
		console.log('$paginationState_derived', $paginationState_derived);
	});
	/**
	 * @typedef {Object} Props
	 * @property {string} [prefix]
	 * @property {any} [extraInfo]
	 * @property {any} [initialGqlArgObj]
	 * @property {any} [isOutermostQMSWraper]
	 * @property {string} [QMSType]
	 * @property {any} [QMSName]
	 * @property {any} [QMS_info]
	 * @property {any} [QMSWraperContext]
	 * @property {any} activeArgumentsDataGrouped_StoreInitialValue
	 * @property {any} [activeArgumentsDataGrouped_Store]
	 * @property {any} [tableColsData_StoreInitialValue]
	 * @property {any} [finalGqlArgObj_Store]
	 * @property {any} QMSWraperContextGiven
	 * @property {boolean} [preferGivenQMSWraperContext]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		prefix = '',
		extraInfo = {},
		initialGqlArgObj = {},
		isOutermostQMSWraper = getContext(`${prefix}QMSWraperContext`) ? false : true,
		QMSType = 'query',
		QMSName = `${Math.random()}`,
		QMS_info = $bindable(schemaData.get_QMS_Field(QMSName, QMSType, schemaData)),
		QMSWraperContext = $bindable({}),
		activeArgumentsDataGrouped_StoreInitialValue,
		activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store(
		activeArgumentsDataGrouped_StoreInitialValue
	),
		tableColsData_StoreInitialValue = $bindable([]),
		finalGqlArgObj_Store = Create_finalGqlArgObj_Store(
		activeArgumentsDataGrouped_Store,
		paginationState
	),
		QMSWraperContextGiven,
		preferGivenQMSWraperContext = true,
		children
	} = $props();
	QMSWraperContext = {
		idColName,
		returningColumnsLocationQMS_Info,
		rowsLocation,
		returningColumnsLocation,
		QMS_info,
		QMSType,
		QMSName,
		activeArgumentsDataGrouped_Store,
		tableColsData_Store,
		finalGqlArgObj_Store,
		QMS_bodyPart_StoreDerived,
		QMS_bodyPart_StoreDerived_rowsCount,
		QMS_bodyPartsUnifier_StoreDerived,
		paginationOptions,
		paginationState,
		paginationState_derived,
		mergedChildren_finalGqlArgObj_Store,
		//mergedChildren_activeArgumentsDataGrouped_Store,
		mergedChildren_QMSWraperCtxData_Store,
		mergedChildren_controlPanel_Store,
		QMSFieldToQMSGetMany_Store,
		extraInfo
	};
	if (preferGivenQMSWraperContext && QMSWraperContextGiven) {
		QMSWraperContext = QMSWraperContextGiven;
	}
	setContext(`${prefix}QMSWraperContext`, QMSWraperContext);
	if (isOutermostQMSWraper) {
		setContext(`${prefix}OutermostQMSWraperContext`, QMSWraperContext);
	}
</script>

{#if isOutermostQMSWraper}
	{#each $mergedChildren_QMSWraperCtxData_Store as QMSWraperCtxDataCurrent (QMSWraperCtxDataCurrent.stepsOfFields.join())}
		<QMSWraperCtxDataCurrentComputations {QMSWraperCtxDataCurrent} />
	{/each}
{/if}

{#if QMS_info || (preferGivenQMSWraperContext && QMSWraperContextGiven)}
	<!-- content here -->
	{#if children}{@render children()}{:else}<!-- optional fallback -->{/if}
{/if}
