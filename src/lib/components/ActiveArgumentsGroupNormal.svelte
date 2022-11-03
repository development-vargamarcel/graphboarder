<script>
	import ActiveArgument from '$lib/components/ActiveArgument.svelte';
	export let group;
	export let argsInfo;
	export let activeArgumentsData;
	export let update_activeArgumentsDataGrouped;
	export let activeArgumentsDataGrouped;
	let showDescription;

	//

	import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action';
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	import { flip } from 'svelte/animate';
	import { createEventDispatcher, setContext } from 'svelte';
	import ActiveArgumentsGroupHasFilterOperators from '$lib/components/ActiveArgumentsGroupHasFilterOperators.svelte';
	import Arg from './Arg.svelte';
	import {
		generate_FINAL_gqlArgObj_fromGroups,
		generate_gqlArgObj_forHasOperators
	} from '$lib/utils/usefulFunctions';

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
</script>

<ul
	use:dndzone={{
		items: group.group_args,
		dragDisabled,
		flipDurationMs,
		transformDraggedElement,
		type: group.group_name
	}}
	on:consider={handleConsider}
	on:finalize={handleFinalize}
	class="mt-2 pt-2 pr-2 rounded-box"
>
	{#each group.group_args as activeArgumentData (activeArgumentData.id)}
		<div animate:flip={{ duration: flipDurationMs }} class="relative flex">
			<div class="grid   content-center  rounded-full ">
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<div
					tabindex={dragDisabled ? 0 : -1}
					aria-label="drag-handle"
					class="bi bi-grip-vertical ml-2  -mr-1"
					style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
					on:mousedown={startDrag}
					on:touchstart={startDrag}
					on:keydown={handleKeyDown}
				/>
			</div>
			<div
				class="w-full "
				on:mousedown={() => {
					dragDisabled = true;
				}}
				on:touchstart={() => {
					dragDisabled = true;
				}}
				on:keydown={() => {
					dragDisabled = true;
				}}
			>
				<ActiveArgument
					on:updateQuery
					on:inUseChanged={() => {
						dispatch('updateQuery');
					}}
					{activeArgumentData}
					{group}
					{activeArgumentsDataGrouped}
					{activeArgumentsData}
				/>
			</div>
		</div>
	{/each}
</ul>
