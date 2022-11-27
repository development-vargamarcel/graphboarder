<script>
	import { Create_paginationInfo } from './../stores/pagination/pginationInfo.ts';
	import { Create_offsetBasedPaginationOptions } from './../stores/pagination/offsetBasedPaginationOptions.ts';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/activeArgumentsDataGrouped_Store';
	import { Create_final_gqlArgObj_Store } from '$lib/stores/final_gqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/tableColsData_Store';
	import { Create_QMS_bodyPart_StoreDerived } from '$lib/stores/QMS_bodyPart_StoreDerived';
	import { setContext } from 'svelte';
	import { Create_QMS_bodyPartsUnifier_StoreDerived } from '$lib/stores/QMS_bodyPartsUnifier_StoreDerived';
	import { Create_offsetBasedPaginationState } from '$lib/stores/pagination/offsetBasedPaginationState';
	import { schemaData } from '$lib/stores/schemaData';
	import { Create_ofsetBasedPaginationState_derived } from '$lib/stores/pagination/ofsetBasedPaginationState_derived';
	export let prefix = '';
	export let QMSType = 'query';
	export let QMSName;
	let currentQMS_Info = schemaData.get_QMS_Field(QMSName, QMSType);
	console.log({ currentQMS_Info });
	const activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store();
	const tableColsData_Store = Create_tableColsData_Store();
	const offsetBasedPaginationOptions = Create_offsetBasedPaginationOptions();
	const offsetBasedPaginationState = Create_offsetBasedPaginationState();
	const ofsetBasedPaginationState_derived = Create_ofsetBasedPaginationState_derived(
		offsetBasedPaginationState
	);
	const final_gqlArgObj_Store = Create_final_gqlArgObj_Store(
		activeArgumentsDataGrouped_Store,
		offsetBasedPaginationState
	);
	const paginationInfo = Create_paginationInfo({
		paginationType: 'offsetBased',
		paginationData: {}
	});

	const QMS_bodyPart_StoreDerived = Create_QMS_bodyPart_StoreDerived(
		final_gqlArgObj_Store,
		tableColsData_Store,
		QMSType,
		QMSName,
		offsetBasedPaginationOptions,
		ofsetBasedPaginationState_derived,
		offsetBasedPaginationState
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
	setContext(`${prefix}offsetBasedPaginationState`, offsetBasedPaginationState);
</script>

<slot><!-- optional fallback --></slot>
