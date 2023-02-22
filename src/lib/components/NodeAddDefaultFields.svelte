<script>
	import { getFields_Grouped } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	export let node;
	export let prefix = '';
	export let group;

	if (node?.items == 0) {
		const { activeArgumentsDataGrouped_Store } = getContext(`${prefix}QMSWraperContext`);
		let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
		const endpointInfo = QMSMainWraperContext?.endpointInfo;
		const schemaData = QMSMainWraperContext?.schemaData;
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

		let baseFilterOperators = ['_and', '_or', '_not']; //!!!this might create problem if there is some nonBase operator with the same name as one of these

		non_scalarFields
			?.filter((arg) => {
				return !baseFilterOperators.includes(arg.dd_displayName);
			})
			?.forEach((element) => {
				let stepsOfFields = [node.dd_displayName, element.dd_displayName];
				// if (stepsOfFields[stepsOfFields.length - 1] !== element.dd_displayName) {
				// 	stepsOfFields.push(element.dd_displayName); //take care might caus eproblems
				// }

				let newContainerData = {
					stepsOfFields,
					stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
					id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
					...element
				};
				console.log({ newContainerData });
				let randomNr = Math.random();
				console.log('group', group);
				let newContainerDataRootType = schemaData.get_rootType(
					null,
					newContainerData.dd_rootName,
					schemaData
				);
				let hasBaseFilterOperators = newContainerDataRootType?.dd_baseFilterOperators;
				let NODEhasBaseFilterOperators = schemaData.get_rootType(
					null,
					node.dd_rootName,
					schemaData
				)?.dd_baseFilterOperators;
				let hasNonBaseFilterOperators = newContainerDataRootType?.dd_nonBaseFilterOperators;

				let isListContainer = newContainerData?.dd_kindList;
				let operator;
				if (!operator && isListContainer) {
					operator = 'list';
				}

				if (
					!operator &&
					hasBaseFilterOperators &&
					node.dd_rootName &&
					!NODEhasBaseFilterOperators
				) {
					operator = '_and';
				}

				if (!operator) {
					operator = 'bonded';
				}

				group.group_argsNode[`${randomNr}`] = {
					...newContainerData,
					inputFields: newContainerDataRootType?.inputFields,
					id: randomNr,
					operator,
					not: false,
					isMain: false,
					items: []
				};
				console.log({ newContainerDataRootType });
				console.log({ newContainerData });
				if (node?.items) {
					node.items.push({ id: randomNr });
				} else {
					group.group_argsNode['mainContainer'].items.push({ id: randomNr });
				}
			});
	}
</script>
