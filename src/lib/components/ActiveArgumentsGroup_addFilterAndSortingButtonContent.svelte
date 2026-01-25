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
	import { Logger } from '$lib/utils/logger';
    import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';

	interface Props {
		group: any;
		argsInfo: any;
		nodes?: any;
		node: any;
		prefix?: string;
		parent_inputFields: any;
        parentNodeId?: any;
        parent_stepsOfFields?: any;
        onUpdateQuery?: () => void;
	}

	let {
		group = $bindable(),
		argsInfo,
		nodes,
		node,
		prefix = '',
		parent_inputFields,
        parentNodeId,
        parent_stepsOfFields,
        onUpdateQuery
	}: Props = $props();

	const groupName = group.group_name;
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	let dragDisabled = true;
	const hasGroup_argsNode = group.group_argsNode;
	const mainContainerOperator = group.group_argsNode?.mainContainer?.operator;
	/////start
	const OutermostQMSWraperContext = getContext<QMSWraperContext>(`${prefix}OutermostQMSWraperContext`);

    const nodeContext = getContext<any>(`${prefix}nodeContext`);
    let pathIsInCP = $derived(nodeContext?.pathIsInCP || false);

	let nodeIsInCP = false;
	const CPItemContext = getContext<any>(`${prefix}CPItemContext`);
	if (CPItemContext?.CPItem.nodeId == node.id) {
		setContext(`${prefix}nodeContext`, { pathIsInCP: true });
		nodeIsInCP = true;
	}
	const isCPChild = CPItemContext ? true : false;

    let visibleInCP = $derived(pathIsInCP || nodeIsInCP);
	let visible = $derived(visibleInCP || !CPItemContext || node.isMain);

    let correctQMSWraperContext: QMSWraperContext;
	if (isCPChild) {
		correctQMSWraperContext = getQMSWraperCtxDataGivenControlPanelItem(
			CPItemContext?.CPItem,
			OutermostQMSWraperContext
		);
	} else {
		correctQMSWraperContext = getContext<QMSWraperContext>(`${prefix}QMSWraperContext`);
	}

    let activeArgumentsDataGrouped_Store = $derived(correctQMSWraperContext?.activeArgumentsDataGrouped_Store);

	/////end
	let rootArgs = $derived(argsInfo.filter((arg: any) => {
		return arg.dd_isRootArg;
	}));

    let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
	let mainWraperCtx = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const schemaData = mainWraperCtx?.schemaData;
	const nodeRootType = getRootType(null, node.dd_rootName, schemaData);

    let groupArgsPossibilities = $derived.by(() => {
		let possibilities;
		if (group.group_isRoot) {
			possibilities = rootArgs;
		} else if (node?.inputFields) {
			possibilities = node?.inputFields;
		} else if (parent_inputFields) {
			possibilities = parent_inputFields;
		} else {
			possibilities = getRootType(null, group.dd_rootName, schemaData).inputFields;
		}
		if (!possibilities) {
			possibilities = node?.args;
		}
		return possibilities;
	});

	let baseFilterOperators = ['_and', '_or', '_not']; //!!!this might create problem if there is some nonBase operator with the same name as one of these
	// groupArgsPossibilities = groupArgsPossibilities.filter((arg) => {
	// 	return !baseFilterOperators.includes(arg.dd_displayName);
	// });
	$effect(() => {
		Logger.debug({ groupArgsPossibilities, node });
	});
	let predefinedFirstSteps = $derived(group.group_isRoot ? [] : [group.group_name]);
	const endpointInfo = mainWraperCtx?.endpointInfo;
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
                    // Use store value
					$activeArgumentsDataGrouped_Store,
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
				onArgAddRequest={(newArgData) => {
                    if ($activeArgumentsDataGrouped_Store) {
                        activeArgumentsDataGrouped_Store.add_activeArgument(
                            newArgData,
                            groupName,
                            node?.id,
                            endpointInfo
                        );
                    }
				}}
				onContainerAddRequest={(newContainerData) => {
					Logger.debug({ newContainerData });
					let randomNr = Math.random();
					Logger.debug('group', group);
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
                        // Use store value
						$activeArgumentsDataGrouped_Store,
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
            stepsOfFields={[]}
		/>
	</div>
</div>
