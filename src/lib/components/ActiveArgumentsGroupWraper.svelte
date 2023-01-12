<script>
	import ActiveArgumentsGroup_addFilterAndSortingButton from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButton.svelte';

	import ActiveArgumentsGroupNormal from '$lib/components/ActiveArgumentsGroupNormal.svelte';

	import ActiveArgument from '$lib/components/ActiveArgument.svelte';
	export let group;
	export let argsInfo;
	export let activeArgumentsData;
	export let update_activeArgumentsDataGrouped;
	let showDescription;
	export let activeArgumentsDataGrouped;

	//

	import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action';
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	import { flip } from 'svelte/animate';
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import ActiveArgumentsGroupHasFilterOperators from '$lib/components/ActiveArgumentsGroupHasFilterOperators.svelte';

	const flipDurationMs = 200;
	let dragDisabled = true;
	const dispatch = createEventDispatcher();
	function handleSort(e) {
		group.group_args = e.detail.items;
		//console.log('choisesWithId', group.group_args);

		dragDisabled = true;
	}
	const transformDraggedElement = (draggedEl, data, index) => {
		draggedEl.querySelector('.dnd-item').classList.add('bg-accent/20', 'border-2', 'border-accent');
	};

	//
	function handleConsider(e) {
		const {
			items: newItems,
			info: { source, trigger }
		} = e.detail;
		handleSort(e);
		// Ensure dragging is stopped on drag finish via keyboard
		if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
			dragDisabled = true;
		}
	}
	function handleFinalize(e) {
		const {
			items: newItems,
			info: { source }
		} = e.detail;
		handleSort(e);
		// Ensure dragging is stopped on drag finish via pointer (mouse, touch)
		if (source === SOURCES.POINTER) {
			dragDisabled = true;
		}
		update_activeArgumentsDataGrouped(group);
		dispatch('updateQuery');
	}
	function startDrag(e) {
		// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
		e.preventDefault();
		dragDisabled = false;
	}
	function handleKeyDown(e) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
	}
	//

	const hasGroup_argsNode = group.group_argsNode;
	//
	const final_gqlArgObj_Store = getContext('final_gqlArgObj_Store');
</script>

<ActiveArgumentsGroup_addFilterAndSortingButton
	on:updateQuery
	bind:group
	bind:argsInfo
	bind:activeArgumentsData
	bind:update_activeArgumentsDataGrouped
	bind:activeArgumentsDataGrouped
/>

{#if hasGroup_argsNode}
	<div class=" ">
		<ActiveArgumentsGroupHasFilterOperators
			on:updateQuery={() => {
				dispatch('updateQuery');
				//console.log({ FINAL_gqlArgObj_fromGroups });
				group.group_args = Object.values(group.group_argsNode)?.filter((node) => {
					return !node?.operator;
				});
				update_activeArgumentsDataGrouped(group);

				final_gqlArgObj_Store.regenerate_groupsAndfinal_gqlArgObj();
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
			final_gqlArgObj_Store.regenerate_groupsAndfinal_gqlArgObj();
		}}
		bind:group
		bind:argsInfo
		bind:activeArgumentsData
		bind:update_activeArgumentsDataGrouped
		bind:activeArgumentsDataGrouped
	/>
{/if}
