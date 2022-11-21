<script>
	import { Create_offsetBasedPaginationOptions } from './../stores/pagination/offsetBasedPaginationOptions.ts';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/activeArgumentsDataGrouped_Store';
	import { Create_final_gqlArgObj_Store } from '$lib/stores/final_gqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/tableColsData_Store';
	import { Create_QMS_bodyPart_StoreDerived } from '$lib/stores/QMS_bodyPart_StoreDerived';
	import { setContext } from 'svelte';
	import { Create_QMS_bodyPartsUnifier_StoreDerived } from '$lib/stores/QMS_bodyPartsUnifier_StoreDerived';

	export let prefix = '';
	export let QMSType = 'query';
	export let QMSName;

	const activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store();
	const tableColsData_Store = Create_tableColsData_Store();
	const final_gqlArgObj_Store = Create_final_gqlArgObj_Store(activeArgumentsDataGrouped_Store);

	const QMS_bodyPart_StoreDerived = Create_QMS_bodyPart_StoreDerived(
		final_gqlArgObj_Store,
		tableColsData_Store,
		QMSType,
		QMSName
	);
	const QMS_bodyPartsUnifier_StoreDerived = Create_QMS_bodyPartsUnifier_StoreDerived(
		[QMS_bodyPart_StoreDerived],
		QMSType
	);
	const offsetBasedPaginationOptions = Create_offsetBasedPaginationOptions();
	$: console.log('QMS_bodyPartsUnifier_StoreDerived', $QMS_bodyPartsUnifier_StoreDerived);
	setContext(`${prefix}activeArgumentsDataGrouped_Store`, activeArgumentsDataGrouped_Store);
	setContext(`${prefix}tableColsData_Store`, tableColsData_Store);
	setContext(`${prefix}final_gqlArgObj_Store`, final_gqlArgObj_Store);
	setContext(`${prefix}QMS_bodyPart_StoreDerived`, QMS_bodyPart_StoreDerived);
	setContext(`${prefix}offsetBasedPaginationOptions`, offsetBasedPaginationOptions);
</script>

<slot><!-- optional fallback --></slot>
