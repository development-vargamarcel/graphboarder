<script>
	import ActiveArgumentsGroup_addFilterAndSortingButton from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButton.svelte';
	import ActiveArgumentsGroup_info from '$lib/components/ActiveArgumentsGroup_info.svelte';

	import ActiveArgumentsGroupNormal from '$lib/components/ActiveArgumentsGroupNormal.svelte';
	export let group;
	export let argsInfo;
	export let update_activeArgumentsDataGrouped;
	export let activeArgumentsDataGrouped;
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import ActiveArgumentsGroupHasFilterOperators from '$lib/components/ActiveArgumentsGroupHasFilterOperators.svelte';
	import Toggle from './fields/Toggle.svelte';
	import { writable } from 'svelte/store';

	let dragDisabled = true;
	const dispatch = createEventDispatcher();
	function handleSort(e) {
		group.group_args = e.detail.items;
		//console.log('choisesWithId', group.group_args);
		dragDisabled = true;
	}
	const hasGroup_argsNode = group.group_argsNode;
	export let prefix = '';

	const { finalGqlArgObj_Store } = getContext(`${prefix}QMSWraperContext`);
	const dndIsOn = writable(false);
	setContext('dndIsOn', dndIsOn);
</script>

<div class="flex  ">
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
	<div class="w-min flex space-x-2 ml-4 {hasGroup_argsNode ? '' : 'pt-1'}">
		<div>dnd:</div>
		<Toggle
			showValue={false}
			otherClases="toggle-sm"
			rawValue={$dndIsOn}
			on:changed={() => {
				$dndIsOn = !$dndIsOn;
			}}
		/>
	</div>
</div>
<div class="pb-10">
	{#if hasGroup_argsNode}
		<div class=" overflow-x-auto overflow-y-visible ">
			<ActiveArgumentsGroupHasFilterOperators
				addDefaultFields={true}
				on:updateQuery={() => {
					dispatch('updateQuery');
					//console.log({ finalGqlArgObj_fromGroups });
					group.group_args = Object.values(group.group_argsNode)?.filter((node) => {
						return !node?.operator;
					});
					update_activeArgumentsDataGrouped(group);

					finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
				}}
				type={group.group_name + 'ActiveArgumentsGroupHasFilterOperators'}
				node={group.group_argsNode.mainContainer}
				originalNodes={group.group_argsNode}
				{group}
				bind:nodes={group.group_argsNode}
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
