<script>
	import { Create_paginationInfo } from '$lib/stores/pagination/paginationInfo';
	import { Create_offsetBasedPaginationOptions } from '$lib/stores/pagination/offsetBasedPaginationOptions';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/activeArgumentsDataGrouped_Store';
	import { Create_final_gqlArgObj_Store } from '$lib/stores/final_gqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/tableColsData_Store';
	import { Create_QMS_bodyPart_StoreDerived } from '$lib/stores/QMS_bodyPart_StoreDerived';
	import { setContext } from 'svelte';
	import { Create_QMS_bodyPartsUnifier_StoreDerived } from '$lib/stores/QMS_bodyPartsUnifier_StoreDerived';
	import { Create_paginationState } from '$lib/stores/pagination/paginationState';
	import { schemaData } from '$lib/stores/schemaData';
	import { Create_paginationState_derived } from '$lib/stores/pagination/paginationState_derived';
	import { paginationTypes } from '$lib/stores/pagination/paginationTypes';
	import { get_scalarColsData, get_nodeFieldsQMS_Info } from '$lib/utils/usefulFunctions';
	import { endpointInfo } from '$lib/stores/endpointInfo/endpointInfo';
	import { get, writable } from 'svelte/store';
	export let prefix = '';
	export let QMSType = 'query';
	export let QMSName;
	let currentQMS_Info = schemaData.get_QMS_Field(QMSName, QMSType);
	console.log({ currentQMS_Info });
	let paginationTypeInfo = paginationTypes.find((pagType) => {
		return pagType.name == currentQMS_Info.dd_paginationType;
	});

	const activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store();
	const offsetBasedPaginationOptions = Create_offsetBasedPaginationOptions();
	const paginationState = Create_paginationState(
		undefined,
		currentQMS_Info.dd_paginationArgs,
		currentQMS_Info.dd_paginationType
	);
	const paginationState_derived = Create_paginationState_derived(
		paginationState,
		currentQMS_Info.dd_paginationArgs,
		currentQMS_Info.dd_paginationType
	);

	let tableColsData_StoreInitialValue = [];

	const rowsLocation = endpointInfo.get_rowsLocation(currentQMS_Info);
	const rowCountLocation = endpointInfo.get_rowCountLocation(currentQMS_Info);
	console.log('get_rowCountLocation', rowCountLocation);
	const nodeFieldsQMS_Info = get_nodeFieldsQMS_Info(currentQMS_Info, rowsLocation);
	let scalarColsData = get_scalarColsData(nodeFieldsQMS_Info, [
		currentQMS_Info.dd_displayName,
		...rowsLocation
	]);
	const dependencyColsData = paginationTypeInfo?.get_dependencyColsData(QMSName, 'query');
	tableColsData_StoreInitialValue = [...scalarColsData, ...dependencyColsData];

	const tableColsData_Store = Create_tableColsData_Store(
		paginationState,
		tableColsData_StoreInitialValue
	);

	const final_gqlArgObj_Store = Create_final_gqlArgObj_Store(
		activeArgumentsDataGrouped_Store,
		paginationState
	);
	const paginationInfo = Create_paginationInfo({
		paginationType: currentQMS_Info.dd_paginationType,
		paginationData: {}
	});

	const QMS_bodyPart_StoreDerived = Create_QMS_bodyPart_StoreDerived(
		final_gqlArgObj_Store,
		tableColsData_Store,
		QMSType,
		QMSName,
		offsetBasedPaginationOptions,
		paginationState_derived,
		currentQMS_Info.dd_paginationType !== 'notAvailable' ? paginationState : null
	);

	const QMS_bodyPartsUnifier_StoreDerived = Create_QMS_bodyPartsUnifier_StoreDerived(
		[QMS_bodyPart_StoreDerived],
		QMSType
	);
	const QMS_bodyPart_StoreDerived_rowsCount = Create_QMS_bodyPart_StoreDerived(
		final_gqlArgObj_Store,
		writable([{ stepsOfFields: rowCountLocation, title: 'count' }]),
		QMSType,
		QMSName,
		offsetBasedPaginationOptions,
		null,
		null
	);
	$: console.log('QMS_bodyPart_StoreDerived_rowsCount', $QMS_bodyPart_StoreDerived_rowsCount);
	setContext(`${prefix}activeArgumentsDataGrouped_Store`, activeArgumentsDataGrouped_Store);
	setContext(`${prefix}tableColsData_Store`, tableColsData_Store);
	setContext(`${prefix}final_gqlArgObj_Store`, final_gqlArgObj_Store);
	setContext(`${prefix}QMS_bodyPart_StoreDerived`, QMS_bodyPart_StoreDerived);
	setContext(`${prefix}QMS_bodyPartsUnifier_StoreDerived`, QMS_bodyPartsUnifier_StoreDerived);
	setContext(`${prefix}offsetBasedPaginationOptions`, offsetBasedPaginationOptions);
	setContext(`${prefix}paginationState`, paginationState);
	//
	setContext(`rowsCountQMS_bodyPart_StoreDerived`, QMS_bodyPart_StoreDerived_rowsCount);
</script>

<slot><!-- optional fallback --></slot>
