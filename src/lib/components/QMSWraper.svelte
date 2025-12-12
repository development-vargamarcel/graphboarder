<script lang="ts">
	import { Create_paginationOptions } from '$lib/stores/pagination/paginationOptions';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import { Create_finalGqlArgObj_Store } from '$lib/stores/QMSHandling/finalGqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/QMSHandling/tableColsData_Store';
	import { Create_QMS_bodyPart_StoreDerived } from '$lib/stores/QMSHandling/QMS_bodyPart_StoreDerived';
	import { getContext, setContext } from 'svelte';
	import { Create_QMS_bodyPartsUnifier_StoreDerived } from '$lib/stores/QMSHandling/QMS_bodyPartsUnifier_StoreDerived';
	import { Create_paginationState } from '$lib/stores/QMSHandling/paginationState';
	import { Create_paginationState_derived } from '$lib/stores/QMSHandling/paginationState_derived';
	import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';
	import {
		get_scalarColsData,
		get_nodeFieldsQMS_info,
		getDeepField
	} from '$lib/utils/usefulFunctions';
	import {
		findReturningColumnsLocation,
		buildPrefixStepsOfFields,
		getIdColumnName,
		getPaginationTypeInfo,
		mergeColumnData
	} from '$lib/utils/qmsContextUtils';
	import type {
		QMSType as QMSTypeType,
		FieldWithDerivedData,
		ActiveArgumentGroup,
		TableColumnData,
		SchemaData,
		EndpointInfoStore,
		PaginationTypeInfo
	} from '$lib/types/index';

	let QMSMainWraperContext = getContext<any>(`${prefix}QMSMainWraperContext`);
	const endpointInfo: EndpointInfoStore = QMSMainWraperContext?.endpointInfo;
	const schemaData: SchemaData = QMSMainWraperContext?.schemaData;
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
	const dd_paginationType: string | undefined = QMS_info?.dd_paginationType;
	const paginationTypes = get_paginationTypes(endpointInfo, schemaData);
	let paginationTypeInfo = getPaginationTypeInfo(dd_paginationType, paginationTypes);
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

	const possibleLocations = QMSType == 'query'
		? $endpointInfo.returningColumnsPossibleLocationsInQueriesPerRow
		: $endpointInfo.returningColumnsPossibleLocationsInMutations;

	const returningColumnsResult = findReturningColumnsLocation(
		nodeFieldsQMS_info,
		possibleLocations,
		schemaData,
		'fields'
	);

	let returningColumnsLocationQMS_Info = returningColumnsResult?.info;
	let returningColumnsLocation = returningColumnsResult?.location || [];

	console.log({ returningColumnsLocationQMS_Info, returningColumnsLocation, QMSType });
	let nodeFieldsQMS_info_Root = schemaData.get_rootType(
		null,
		nodeFieldsQMS_info?.dd_rootName,
		schemaData
	);

	let prefixStepsOfFields = buildPrefixStepsOfFields(
		QMSType,
		QMS_info.dd_displayName,
		rowsLocation,
		returningColumnsLocation
	);

	let scalarColsData = get_scalarColsData(
		returningColumnsLocationQMS_Info,
		prefixStepsOfFields,
		schemaData
	);

	const dependencyColsData = paginationTypeInfo?.get_dependencyColsData(
		QMSName,
		'query',
		schemaData
	) || [];

	tableColsData_StoreInitialValue = mergeColumnData(
		scalarColsData,
		tableColsData_StoreInitialValue,
		dependencyColsData
	);
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

	import JSON5 from 'json5';

	// Debug effects
	$effect(() => {
		console.log('$QMSFieldToQMSGetMany_Store ', $QMSFieldToQMSGetMany_Store);
	});

	$effect(() => {
		console.log(
			'$mergedChildren_finalGqlArgObj_Store',
			'\n',
			$mergedChildren_finalGqlArgObj_Store,
			JSON5.stringify($mergedChildren_finalGqlArgObj_Store, { quote: '"' })
		);
	});

	$effect(() => {
		console.log('$mergedChildren_QMSWraperCtxData_Store ', $mergedChildren_QMSWraperCtxData_Store);
	});

	$effect(() => {
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

	let idColName = getIdColumnName(
		returningColumnsLocationQMS_Info,
		QMS_info,
		endpointInfo,
		schemaData
	);

	$effect(() => {
		console.log('$paginationState', $paginationState);
	});

	$effect(() => {
		console.log('$paginationState_derived', $paginationState_derived);
	});
	interface Props {
		prefix?: string;
		extraInfo?: Record<string, unknown>;
		initialGqlArgObj?: Record<string, unknown>;
		isOutermostQMSWraper?: boolean;
		QMSType?: QMSTypeType;
		QMSName?: string;
		QMS_info?: FieldWithDerivedData | undefined;
		QMSWraperContext?: Record<string, unknown>;
		activeArgumentsDataGrouped_StoreInitialValue: ActiveArgumentGroup[] | undefined;
		activeArgumentsDataGrouped_Store?: any;
		tableColsData_StoreInitialValue?: TableColumnData[];
		finalGqlArgObj_Store?: any;
		QMSWraperContextGiven: any;
		preferGivenQMSWraperContext?: boolean;
		children?: import('svelte').Snippet;
	}

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
	}: Props = $props();
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
	{@render children?.()}
{/if}
