<script>
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
	import { get_scalarColsData, get_nodeFieldsQMS_info } from '$lib/utils/usefulFunctions';
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	export let initialGqlArgObj = {};
	import { get, writable } from 'svelte/store';
	export let QMSType = 'query';
	export let QMSName;
	let QMS_info = schemaData.get_QMS_Field(QMSName, QMSType, schemaData);
	console.log({ QMS_info });
	const dd_paginationType = QMS_info?.dd_paginationType;
	let paginationTypeInfo;
	if (dd_paginationType) {
		paginationTypeInfo = get_paginationTypes(endpointInfo, schemaData).find((pagType) => {
			//console.log({ QMS_info }, { dd_paginationType });
			return pagType.name == dd_paginationType;
		});
	}

	let QMSWraperContext = {};
	const activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store();
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

	export let tableColsData_StoreInitialValue = [];

	const rowsLocation = endpointInfo.get_rowsLocation(QMS_info);
	const nodeFieldsQMS_info = get_nodeFieldsQMS_info(QMS_info, rowsLocation, schemaData);
	let scalarColsData = get_scalarColsData(
		nodeFieldsQMS_info,
		[QMS_info.dd_displayName, ...rowsLocation],
		schemaData
	);
	if (tableColsData_StoreInitialValue?.length == 0) {
		const dependencyColsData = paginationTypeInfo?.get_dependencyColsData(
			QMSName,
			'query',
			schemaData
		);
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
		paginationState_derived,
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
			null
		);
	}
	//set to QMSWraperContext
	QMSWraperContext = {
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
		paginationState
	};
	setContext(`${prefix}QMSWraperContext`, QMSWraperContext);
</script>

{#if QMS_info}
	<!-- content here -->
	<slot><!-- optional fallback --></slot>
{/if}
