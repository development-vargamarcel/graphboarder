<script>
	import ActiveArgumentsGroup_addFilterAndSortingButton from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButton.svelte';
	import ActiveArgumentsGroup_info from '$lib/components/ActiveArgumentsGroup_info.svelte';

	import ActiveArgumentsGroupNormal from '$lib/components/ActiveArgumentsGroupNormal.svelte';
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import ActiveArgumentsGroupHasFilterOperators from '$lib/components/ActiveArgumentsGroupHasFilterOperators.svelte';
	import Toggle from './fields/Toggle.svelte';
	import { writable } from 'svelte/store';
	import GroupDescriptionAndControls from './GroupDescriptionAndControls.svelte';
	/** @type {{group: any, argsInfo: any, update_activeArgumentsDataGrouped: any, activeArgumentsDataGrouped: any, prefix?: string}} */
	let {
		group = $bindable(),
		argsInfo = $bindable(),
		update_activeArgumentsDataGrouped = $bindable(),
		activeArgumentsDataGrouped = $bindable(),
		prefix = ''
	} = $props();
	let dragDisabled = true;
	const dispatch = createEventDispatcher();
	function handleSort(e) {
		group.group_args = e.detail.items;
		//console.log('choisesWithId', group.group_args);
		dragDisabled = true;
	}
	const hasGroup_argsNode = group.group_argsNode;

	const { finalGqlArgObj_Store } = getContext(`${prefix}QMSWraperContext`);
	const CPItemContext = getContext(`${prefix}CPItemContext`);

	const dndIsOn = writable(false);
	const showInputField = writable(false);
	setContext('dndIsOn', dndIsOn);
	setContext('showInputField', showInputField);

	// const mutationVersion = writable(
	// 	!CPItemContext || group.group_argsNode[CPItemContext.CPItem.nodeId]?.operator ? false : true
	// );
	const mutationVersion = writable(false);
	setContext('mutationVersion', mutationVersion);
	let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
</script>

{#if !CPItemContext}
	<div class="flex space-x-1">
		<ActiveArgumentsGroup_info {group} />
		{#if !hasGroup_argsNode}
			<ActiveArgumentsGroup_addFilterAndSortingButton
				on:updateQuery
				bind:group
				bind:argsInfo
				bind:update_activeArgumentsDataGrouped
				bind:activeArgumentsDataGrouped
				node={group.group_argsNode?.mainContainer}
			/>
		{/if}
		<GroupDescriptionAndControls {hasGroup_argsNode} />
	</div>{/if}

<div class="pb-10==">
	{#if hasGroup_argsNode}
		<div class=" overflow-x-auto overflow-y-visible">
			<ActiveArgumentsGroupHasFilterOperators
				addDefaultFields={true}
				on:updateQuery={() => {
					dispatch('updateQuery');
					//console.log({ finalGqlArgObj_fromGroups });
					group.group_args = Object.values(group.group_argsNode)?.filter((node) => {
						return !node?.operator;
					});
					update_activeArgumentsDataGrouped(group);
					if (!activeArgumentsContext.isControlPanelChild) {
						finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
					}
				}}
				type={group.group_name + 'ActiveArgumentsGroupHasFilterOperators'}
				node={CPItemContext
					? group.group_argsNode[CPItemContext?.CPItem.nodeId]
					: group.group_argsNode.mainContainer}
				originalNodes={group.group_argsNode}
				{group}
				nodes={group.group_argsNode}
				on:changed={() => {
					group.group_args = Object.values(group.group_argsNode)?.filter((node) => {
						return !node?.operator;
					});
					update_activeArgumentsDataGrouped(group);
					dispatch('updateQuery');
				}}
			/>
		</div>
	{:else}
		<ActiveArgumentsGroupNormal
			on:updateQuery={() => {
				update_activeArgumentsDataGrouped(group);
				finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
			}}
			bind:group
			bind:argsInfo
			bind:update_activeArgumentsDataGrouped
			bind:activeArgumentsDataGrouped
		/>
	{/if}
</div>
