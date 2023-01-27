<script>
	import { Create_paginationInfo } from '$lib/stores/pagination/paginationInfo';
	import { Create_paginationOptions } from '$lib/stores/pagination/paginationOptions';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/activeArgumentsDataGrouped_Store';
	import { Create_final_gqlArgObj_Store } from '$lib/stores/final_gqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/tableColsData_Store';
	import { Create_QMS_bodyPart_StoreDerived } from '$lib/stores/QMS_bodyPart_StoreDerived';
	import { setContext } from 'svelte';
	import { Create_QMS_bodyPartsUnifier_StoreDerived } from '$lib/stores/QMS_bodyPartsUnifier_StoreDerived';
	import { Create_paginationState } from '$lib/stores/pagination/paginationState';
	import { schemaData } from '$lib/stores/schemaData';
	import { Create_paginationState_derived } from '$lib/stores/pagination/paginationState_derived';
	import { get_scalarColsData, get_nodeFieldsQMS_info } from '$lib/utils/usefulFunctions';
	import { endpointInfo } from '$lib/stores/endpointInfo';
	import { get, writable } from 'svelte/store';
	export let prefix = '';
	export let QMSType = 'query';
	export let QMSName;
	let currentQMS_info = schemaData.get_QMS_Field(QMSName, QMSType);
	console.log({ currentQMS_info });
	let paginationTypeInfo = $endpointInfo.paginationTypes.find((pagType) => {
		return pagType.name == currentQMS_info.dd_paginationType;
	});
	let QMSWraperContext = {};
	const activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store();
	const paginationOptions = Create_paginationOptions();
	const paginationState = Create_paginationState(
		undefined,
		currentQMS_info.dd_paginationArgs,
		currentQMS_info.dd_paginationType
	);
	const paginationState_derived = Create_paginationState_derived(
		paginationState,
		currentQMS_info.dd_paginationArgs,
		currentQMS_info.dd_paginationType
	);

	export let tableColsData_StoreInitialValue = [];

	const rowsLocation = endpointInfo.get_rowsLocation(currentQMS_info);
	const nodeFieldsQMS_info = get_nodeFieldsQMS_info(currentQMS_info, rowsLocation);
	let scalarColsData = get_scalarColsData(nodeFieldsQMS_info, [
		currentQMS_info.dd_displayName,
		...rowsLocation
	]);
	if (tableColsData_StoreInitialValue?.length == 0) {
		const dependencyColsData = paginationTypeInfo?.get_dependencyColsData(QMSName, 'query');
		tableColsData_StoreInitialValue = [...scalarColsData, ...dependencyColsData];
	}

	const tableColsData_Store = Create_tableColsData_Store(
		paginationState,
		tableColsData_StoreInitialValue
	);

	const final_gqlArgObj_Store = Create_final_gqlArgObj_Store(
		activeArgumentsDataGrouped_Store,
		paginationState
	);
	// const paginationInfo = Create_paginationInfo({
	// 	paginationType: currentQMS_info.dd_paginationType,
	// 	paginationData: {}
	// });

	const QMS_bodyPart_StoreDerived = Create_QMS_bodyPart_StoreDerived(
		final_gqlArgObj_Store,
		tableColsData_Store,
		QMSType,
		QMSName,
		paginationOptions,
		paginationState_derived,
		currentQMS_info.dd_paginationType !== 'notAvailable' ? paginationState : null
	);

	const QMS_bodyPartsUnifier_StoreDerived = Create_QMS_bodyPartsUnifier_StoreDerived(
		[QMS_bodyPart_StoreDerived],
		QMSType
	);

	let QMS_bodyPart_StoreDerived_rowsCount = null;
	const rowCountLocation = endpointInfo.get_rowCountLocation(currentQMS_info);
	if (rowCountLocation) {
		const tableColsData_Store_rowsCount = writable([
			{ stepsOfFields: rowCountLocation, title: 'count' }
		]);

		QMS_bodyPart_StoreDerived_rowsCount = Create_QMS_bodyPart_StoreDerived(
			final_gqlArgObj_Store,
			tableColsData_Store_rowsCount,
			QMSType,
			rowCountLocation[0],
			paginationOptions,
			null,
			null
		);
	}
	//set to QMSWraperContext
	QMSWraperContext = {
		QMS_bodyPart_StoreDerived_rowsCount,
		activeArgumentsDataGrouped_Store,
		tableColsData_Store,
		final_gqlArgObj_Store,
		QMS_bodyPart_StoreDerived,
		QMS_bodyPartsUnifier_StoreDerived,
		paginationOptions,
		paginationState
	};
	setContext(`${prefix}QMSWraperContext`, QMSWraperContext);
</script>

<slot><!-- optional fallback --></slot>
