<script>
	import { getFields_Grouped } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';

	export let node;
	export let prefix = '';
	const { activeArgumentsDataGrouped_Store } = getContext(`${prefix}QMSWraperContext`);
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	export let group;
	console.log({ node });
	const node_rootType = schemaData.get_rootType(null, node.dd_rootName, schemaData);
	console.log({ node_rootType });
	let { scalarFields, non_scalarFields } = getFields_Grouped(node_rootType);
	console.log({ scalarFields });

	scalarFields.forEach((element) => {
		let stepsOfFields = [node.dd_displayName, element.dd_displayName];
		let newArgData = {
			stepsOfFields,
			stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
			id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
			...element
		};
		activeArgumentsDataGrouped_Store.add_activeArgument(newArgData, group.group_name, node?.id);
	});
</script>
