<script>
	import { Create_paginationOptions } from '$lib/stores/pagination/paginationOptions';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import { Create_finalGqlArgObj_Store } from '$lib/stores/QMSHandling/finalGqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/QMSHandling/tableColsData_Store';
	import { Create_QMS_bodyPart_StoreDerived } from '$lib/stores/QMSHandling/QMS_bodyPart_StoreDerived';
	import { setContext } from 'svelte';
	import { Create_QMS_bodyPartsUnifier_StoreDerived } from '$lib/stores/QMSHandling/QMS_bodyPartsUnifier_StoreDerived';
	import { Create_paginationState } from '$lib/stores/QMSHandling/paginationState';
	import { schemaData } from '$lib/stores/endpointHandling/schemaData';
	import { Create_paginationState_derived } from '$lib/stores/QMSHandling/paginationState_derived';
	import { paginationTypes } from '$lib/stores/pagination/paginationTypes';
	import { get_scalarColsData, get_nodeFieldsQMS_info } from '$lib/utils/usefulFunctions';
	import { endpointInfo } from '$lib/stores/endpointHandling/endpointInfo';
	import { get, writable } from 'svelte/store';
	export let prefix = '';
	export let QMSType = 'query';
	export let QMSName;
	let currentQMS_info = schemaData.get_QMS_Field(QMSName, QMSType);
	console.log({ currentQMS_info });
	let paginationTypeInfo = paginationTypes.find((pagType) => {
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

	const finalGqlArgObj_Store = Create_finalGqlArgObj_Store(
		activeArgumentsDataGrouped_Store,
		paginationState
	);

	const QMS_bodyPart_StoreDerived = Create_QMS_bodyPart_StoreDerived(
		finalGqlArgObj_Store,
		tableColsData_Store,
		QMSType,
		QMSName,
		paginationOptions,
		paginationState_derived
	);

	const QMS_bodyPartsUnifier_StoreDerived = Create_QMS_bodyPartsUnifier_StoreDerived(
		[QMS_bodyPart_StoreDerived],
		QMSType
	);
	console.log('QMS_bodyPartsUnifier_StoreDerived', QMS_bodyPartsUnifier_StoreDerived);
	let QMS_bodyPart_StoreDerived_rowsCount = null;
	const rowCountLocation = endpointInfo.get_rowCountLocation(currentQMS_info);
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
			null
		);
	}
	//set to QMSWraperContext
	QMSWraperContext = {
		QMS_info: currentQMS_info,
		activeArgumentsDataGrouped_Store,
		tableColsData_Store,
		finalGqlArgObj_Store,
		QMS_bodyPart_StoreDerived,
		QMS_bodyPart_StoreDerived_rowsCount,
		QMS_bodyPartsUnifier_StoreDerived,
		paginationOptions,
		paginationState
	};
	setContext(`${prefix}QMSWraperContext`, QMSWraperContext);
</script>

<slot><!-- optional fallback --></slot>
