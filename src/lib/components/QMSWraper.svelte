<script>
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/activeArgumentsDataGrouped_Store';
	import { Create_final_gqlArgObj_Store } from '$lib/stores/final_gqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/tableColsData_Store';
	import { Create_QMS_body_StoreDerived } from '$lib/stores/QMS_body_StoreDerived';
	import { setContext } from 'svelte';
	import { Create_QMS_body_Store } from '$lib/stores/QMS_body_Store';
	export let prefix = '';
	export let QMSType = 'query';
	export let QMSName;

	let activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store();
	setContext(`${prefix}activeArgumentsDataGrouped_Store`, activeArgumentsDataGrouped_Store);
	const tableColsData_Store = Create_tableColsData_Store();
	setContext(`${prefix}tableColsData_Store`, tableColsData_Store);
	const final_gqlArgObj_Store = Create_final_gqlArgObj_Store(activeArgumentsDataGrouped_Store);
	setContext(`${prefix}final_gqlArgObj_Store`, final_gqlArgObj_Store);
	const QMS_body_Store = Create_QMS_body_Store(
		tableColsData_Store,
		activeArgumentsDataGrouped_Store,
		QMSType,
		QMSName
	);
	setContext(`${prefix}QMS_body_Store`, QMS_body_Store);
	const QMS_body_StoreDerived = Create_QMS_body_StoreDerived(
		final_gqlArgObj_Store,
		tableColsData_Store,
		QMSType,
		QMSName
	);
	setContext(`${prefix}QMS_body_StoreDerived`, QMS_body_StoreDerived);
</script>

<slot><!-- optional fallback --></slot>
