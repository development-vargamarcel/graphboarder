<script>
	import { flip } from 'svelte/animate';
	import {
		dndzone,
		SHADOW_PLACEHOLDER_ITEM_ID,
		SHADOW_ITEM_MARKER_PROPERTY_NAME
	} from 'svelte-dnd-action';
	import { createEventDispatcher } from 'svelte';
	import ActiveArgument from './ActiveArgument.svelte';
	const dispatch = createEventDispatcher();
	export let nodes;
	export let node;
	export let availableOperators;
	export let group;
	let dragDisabled = true;

	const flipDurationMs = 300;
	function handleDndConsider(e) {
		console.log('considering', e, nodes);
		node.items = e.detail.items;
		dragDisabled = true;
	}
	function handleDndFinalize(e) {
		node.items = e.detail.items;
		console.log(e);
		nodes = { ...nodes };
		dispatch('changed');
		dragDisabled = true;
	}

	//
	let labelEl;
	let shadowEl;
	let shadowHeight = 20;
	let shadowWidth = 20;

	let labelElClone;

	$: if (labelEl) {
		shadowHeight = labelEl.clientHeight;
		shadowWidth = labelEl.clientWidth;
	}

	$: console.log(shadowEl);
	$: if (shadowHeight && shadowEl) {
		if (shadowEl.style.height == 0) {
			//if (shadowEl.style.height == 0) ensures the bellow runs only once per grab of element to move
			shadowEl.style.height = `${shadowHeight + 18}px`;
			shadowEl.style.width = `${shadowWidth}px`;

			//put labelElClone in place of shadowEl
			// if (labelElClone) {
			// 	shadowEl.removeChild(labelElClone);
			// }
			labelElClone = labelEl.cloneNode(true);
			labelElClone.classList.remove('dnd-item');
			labelElClone.classList.add('border-2', 'border-accent');

			shadowEl.appendChild(labelElClone);
		}
	}
	function startDrag(e) {
		// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
		e.preventDefault();
		dragDisabled = false;
	}
	function handleKeyDown(e) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
	}
	const transformDraggedElement = (draggedEl, data, index) => {
		draggedEl.querySelector('.dnd-item').classList.add('bg-accent', 'border-2', 'border-accent');
	};
	//
	const dragDisabledConstantTest = true;
</script>

<div
	class=" w-full {node?.operator
		? 'rounded-tl-md bg-gradient-to-br from-primary-focus/5 to-transparent'
		: ''} "
	bind:this={labelEl}
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
	{#if node?.operator}
		<b
			style="color:{node.color}"
			on:click={() => {
				if (node?.operator) {
					if (node?.operator == '_or') {
						node.operator = '_and';
					} else {
						node.operator = '_or';
					}
				}
				dispatch('changed');
			}}
		>
			{node.operator}
		</b>
		<br />
	{:else}
		<div
			class="transition-color duration-500 rounded-box border-l-2 pr-2 {node.not
				? ' border-error'
				: 'border-transparent'}  w-full"
		>
			<ActiveArgument
				on:contextmenu={() => {
					if (node?.not !== undefined) {
						node.not = !node.not;
					}
				}}
				on:inUseChanged={() => {}}
				on:delete_activeArgument={() => {}}
				activeArgumentData={node}
				{group}
			/>
		</div>
		<!-- 
			{generate_final_gqlArgObj}
			{delete_activeArgument}
			{activeArgumentsDataGrouped}
			{activeArgumentsData} -->
	{/if}

	{#if node.hasOwnProperty('items')}
		<section
			class=" rounded-l-none {node?.items?.length == 0 ? 'pt-20' : ''} {node?.isMain
				? 'pb-10 border-l-2 border-l-primary'
				: ''} w-full"
			use:dndzone={{
				items: node.items,
				dragDisabled,
				flipDurationMs,
				centreDraggedOnCursor: false
			}}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}
		>
			<!-- WE FILTER THE SHADOW PLACEHOLDER THAT WAS ADDED IN VERSION 0.7.4, filtering this way rather than checking whether 'nodes' have the id became possible in version 0.9.1 -->
			{#each node.items.filter((item) => {
				return item.id !== SHADOW_PLACEHOLDER_ITEM_ID;
			}) as item (item.id)}
				<div
					animate:flip={{ duration: flipDurationMs }}
					class="  flex  border-l-2 {!nodes[item.id].operator
						? ' border-accent-focus/25'
						: 'border-primary/25'} "
				>
					<div class=" grid   content-center">
						<div
							tabindex={dragDisabled ? 0 : -1}
							aria-label="drag-handle"
							class="bi bi-grip-vertical pt-3 pr-[1]"
							style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
							on:mousedown={startDrag}
							on:touchstart={startDrag}
							on:keydown={handleKeyDown}
						/>
					</div>

					<svelte:self bind:nodes node={nodes[item.id]} on:changed {availableOperators} {group} />
				</div>
			{/each}
		</section>
	{/if}
</div>
{#if node.id == SHADOW_PLACEHOLDER_ITEM_ID}
	<div class=" ml-8 h-0     top-0 left-0 visible" id="shadowEl" bind:this={shadowEl} />
{/if}

<style>
</style>
