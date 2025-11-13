<script lang="ts">
	import ActiveArgument from '$lib/components/ActiveArgument.svelte';
	import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { getContext, setContext } from 'svelte';

	let {
		group = $bindable(),
		argsInfo,
		update_activeArgumentsDataGrouped,
		activeArgumentsDataGrouped,
		onUpdateQuery
	} = $props();

	let showDescription;

	//

	// notice - fade in works fine but don't add svelte's fade-out (known issue)

	const flipDurationMs = 200;
	let dragDisabled = $state(true);
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
		onUpdateQuery?.();
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
	const dndIsOn = getContext('dndIsOn');
	const showInputField = getContext('showInputField');
</script>

<ul
	use:dndzone={{
		items: group.group_args,
		dragDisabled,
		flipDurationMs,
		transformDraggedElement,
		type: group.group_name
	}}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
	class=" pt-2 pr-2 rounded-box"
>
	{#each group.group_args as activeArgumentData (activeArgumentData.id)}
		<div animate:flip={{ duration: flipDurationMs }} class="relative flex">
			{#if $dndIsOn}
				<div class="grid   content-center  rounded-full ">
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						tabindex={dragDisabled ? 0 : -1}
						aria-label="drag-handle"
						class="bi bi-grip-vertical ml-2  -mr-1"
						style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
						onmousedown={startDrag}
						ontouchstart={startDrag}
						onkeydown={handleKeyDown}
					></div>
				</div>
			{/if}

			<div
				class="w-full "
				onmousedown={() => {
					dragDisabled = true;
				}}
				ontouchstart={() => {
					dragDisabled = true;
				}}
				onkeydown={() => {
					dragDisabled = true;
				}}
			>
				<ActiveArgument
					{onUpdateQuery}
					onInUseChanged={() => {
						onUpdateQuery?.();
					}}
					{activeArgumentData}
					{group}
					{activeArgumentsDataGrouped}
				/>
			</div>
		</div>
	{/each}
</ul>
