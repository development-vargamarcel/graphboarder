<script>
	import { Create_paginationInfo } from './../stores/pagination/pginationInfo.ts';
	import { Create_offsetBasedPaginationOptions } from './../stores/pagination/offsetBasedPaginationOptions.ts';
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
	import { get_scalarColsData } from '$lib/utils/usefulFunctions';
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
	let scalarColsData = get_scalarColsData(currentQMS_Info);

	const dependencyColsData = paginationTypeInfo?.get_dependencyColsData(QMSName);
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

	//$: console.log('QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
	setContext(`${prefix}activeArgumentsDataGrouped_Store`, activeArgumentsDataGrouped_Store);
	setContext(`${prefix}tableColsData_Store`, tableColsData_Store);
	setContext(`${prefix}final_gqlArgObj_Store`, final_gqlArgObj_Store);
	setContext(`${prefix}QMS_bodyPart_StoreDerived`, QMS_bodyPart_StoreDerived);
	setContext(`${prefix}offsetBasedPaginationOptions`, offsetBasedPaginationOptions);
	setContext(`${prefix}paginationState`, paginationState);
</script>

<slot><!-- optional fallback --></slot>
