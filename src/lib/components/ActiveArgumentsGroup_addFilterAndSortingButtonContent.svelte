<script lang="ts">
	import Type from '$lib/components/Type.svelte';
	import Description from './Description.svelte';
	import { getContext, setContext } from 'svelte';
	import Arg from '$lib/components/Arg.svelte';
	import {
		getQMSWraperCtxDataGivenControlPanelItem,
		getRootType
	} from '$lib/utils/usefulFunctions';
	import { add_activeArgumentOrContainerTo_activeArgumentsDataGrouped } from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import ManyToAllSelectInterfaceDefinition from './ManyToAllSelectInterfaceDefinition.svelte';

	interface Props {
		group: any;
		argsInfo: any;
		activeArgumentsDataGrouped: any;
		node: any;
		prefix?: string;
		parent_inputFields: any;
	}

	let {
		group = $bindable(),
		argsInfo,
		activeArgumentsDataGrouped,
		node,
		prefix = '',
		parent_inputFields
	}: Props = $props();

	const groupName = group.group_name;
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	let dragDisabled = true;
	const hasGroup_argsNode = group.group_argsNode;
	const mainContainerOperator = group.group_argsNode?.mainContainer?.operator;
	/////start
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	let pathIsInCP = false;
	const nodeContext = getContext(`${prefix}nodeContext`);
	if (nodeContext) {
		pathIsInCP = nodeContext?.pathIsInCP;
	}
	let nodeIsInCP = false;
	const CPItemContext = getContext(`${prefix}CPItemContext`);
	if (CPItemContext?.CPItem.nodeId == node.id) {
		setContext(`${prefix}nodeContext`, { pathIsInCP: true });
		nodeIsInCP = true;
	}
	const isCPChild = CPItemContext ? true : false;
	const visibleInCP = pathIsInCP || nodeIsInCP;
	const visible = visibleInCP || !CPItemContext || node.isMain;
	let correctQMSWraperContext;
	if (isCPChild) {
		correctQMSWraperContext = getQMSWraperCtxDataGivenControlPanelItem(
			CPItemContext?.CPItem,
			OutermostQMSWraperContext
		);
	} else {
		correctQMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	}
	const { finalGqlArgObj_Store, QMS_info, activeArgumentsDataGrouped_Store } =
		correctQMSWraperContext;
	/////end
	let rootArgs = argsInfo.filter((arg) => {
		return arg.dd_isRootArg;
	});
	let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	const nodeRootType = getRootType(null, node.dd_rootName, schemaData);
	let groupArgsPossibilities = $state();
	if (group.group_isRoot) {
		groupArgsPossibilities = rootArgs;
	} else if (node?.inputFields) {
		groupArgsPossibilities = node?.inputFields;
	} else if (parent_inputFields) {
		groupArgsPossibilities = parent_inputFields;
	} else {
		groupArgsPossibilities = getRootType(null, group.dd_rootName, schemaData).inputFields;
	}
	if (!groupArgsPossibilities) {
		groupArgsPossibilities = node?.args;
	}
	let baseFilterOperators = ['_and', '_or', '_not']; //!!!this might create problem if there is some nonBase operator with the same name as one of these
	// groupArgsPossibilities = groupArgsPossibilities.filter((arg) => {
	// 	return !baseFilterOperators.includes(arg.dd_displayName);
	// });
	console.log({ groupArgsPossibilities, node });
	let predefinedFirstSteps = group.group_isRoot ? [] : [group.group_name];
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
</script>

<div
	class="flex flex-col overflow-x-auto overscroll-contain text-sm text-base-content font-normal normal-case min-w-full w-full "
>
	{#if hasGroup_argsNode}
		<button
			class="btn btn-primary btn-xs  normal-case font-thin text-base sticky top-0"
			onclick={() => {
				let randomNr = Math.random();
				const newContainerData = {
					...node,
					addDefaultFields: true,
					dd_displayName: undefined,
					id: randomNr,
					operator: OutermostQMSWraperContext?.QMSType == 'mutation' ? 'bonded' : '~spread~',
					not: false,
					isMain: false,
					items: []
				};
				add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(
					newContainerData,
					groupName,
					node?.id,
					activeArgumentsDataGrouped,
					endpointInfo,
					group
				);
				group = group;
			}}
		>
			{OutermostQMSWraperContext?.QMSType == 'mutation' ? 'add item' : 'add container'}
		</button>
		<!-- <ManyToAllSelectInterfaceDefinition
			bind:selectedRowsColValues
			{originalNodes}
			{type}
			bind:nodes
			{node}
			{parentNode}
			{parentNodeId}
			{availableOperators}
			{group}
		/> -->
	{/if}
	<div class="my-2 border-2 rounded-box ">
		{#each groupArgsPossibilities as arg, index}
			<Arg
				{index}
				type={arg}
				template="changeArguments"
				{predefinedFirstSteps}
				groupName={group.group_name}
				on:argAddRequest={(e) => {
					let newArgData = e.detail;
					activeArgumentsDataGrouped_Store.add_activeArgument(
						newArgData,
						groupName,
						node?.id,
						endpointInfo
					);
				}}
				on:containerAddRequest={(e) => {
					let newContainerData = e.detail;
					console.log({ newContainerData });
					let randomNr = Math.random();
					console.log('group', group);
					let newContainerDataRootType = getRootType(
						null,
						newContainerData.dd_rootName,
						schemaData
					);
					let hasBaseFilterOperators = newContainerDataRootType?.dd_baseFilterOperators;
					let NODEhasBaseFilterOperators = getRootType(
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

					// if (
					// 	!operator &&
					// 	hasBaseFilterOperators &&
					// 	node.dd_rootName &&
					// 	!NODEhasBaseFilterOperators
					// ) {
					// 	operator = '_and';
					// }

					if (!operator) {
						operator = 'bonded';
					}
					newContainerData = {
						...newContainerData,
						inputFields: newContainerDataRootType?.inputFields,
						id: randomNr,
						operator,
						not: false,
						isMain: false,
						items: []
					};
					add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(
						newContainerData,
						groupName,
						node?.id,
						activeArgumentsDataGrouped,
						endpointInfo,
						group
					);
					group = group;
				}}
			/>
		{/each}
	</div>
	<Description QMSInfo={node} />
	<div class="mt-2  w-full overflow-x-auto ">
		<Type
			index={0}
			type={node}
			template="default"
			depth={0}
			on:colAddRequest={(e) => {
				//console.log(e);
			}}
		/>
	</div>
</div>
