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

	let dragDisabled = true;
	const dispatch = createEventDispatcher();
	function handleSort(e) {
		group.group_args = e.detail.items;
		//console.log('choisesWithId', group.group_args);
		dragDisabled = true;
	}
	const hasGroup_argsNode = group.group_argsNode;
	const { finalGqlArgObj_Store } = getContext('QMSWraperContext');
</script>

<div class="flex pl-2">
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
</div>

{#if hasGroup_argsNode}
	<div class="overflow-x-auto  md:overscroll-x-auto  ">
		<ActiveArgumentsGroupHasFilterOperators
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
