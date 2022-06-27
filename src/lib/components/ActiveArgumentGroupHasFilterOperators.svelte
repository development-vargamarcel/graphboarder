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
	export let type;
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
		//e.preventDefault();
		dragDisabled = false;
	}
	function handleKeyDown(e) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
	}
	const transformDraggedElement = (draggedEl, data, index) => {
		draggedEl
			.querySelector('.dnd-item')
			?.classList.add('bg-accent/25', 'border-2', 'border-accent');
	};
	//
	const dragDisabledConstantTest = true;
</script>

{#if !node?.isMain}
	<div class=" grid   content-center  rounded-full ">
		<div
			tabindex={dragDisabled ? 0 : -1}
			aria-label="drag-handle"
			class="  transition:all duration-500 bi bi-grip-vertical ml-2  -mr-1 text-lg rounded-l-md {node?.operator ==
			undefined
				? 'text-base-content'
				: node?.operator == '_and'
				? 'text-primary'
				: 'text-accent-focus'} {node?.not ? ' bg-gradient-to-r from-base-300/100' : 'bg-error/0'}"
			style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
			on:mousedown={(e) => {
				// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
				e.preventDefault();

				dispatch('childrenStartDrag');
			}}
			on:touchstart={(e) => {
				// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
				e.preventDefault();

				dispatch('childrenStartDrag');
			}}
			on:keydown={handleKeyDown}
			on:contextmenu|preventDefault|stopPropagation={() => {
				if (node?.not !== undefined) {
					node.not = !node.not;
				}
			}}
		/>
	</div>{/if}

<div
	class=" w-full transition-all duration-500   {node?.operator
		? 'rounded-l-md bg-gradient-to-rxxx   border-l-[1px] my-1'
		: ''} 
{node?.operator && node?.not ? 'border-dashed  ' : ''} 
{node?.operator == '_and' ? 'border-primary' : 'border-accent-focus '}"
	on:contextmenu|preventDefault|stopPropagation={() => {
		if (node?.not !== undefined) {
			node.not = !node.not;
		}
	}}
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
		<div class="flex">
			<p
				style=""
				class="px-2 pb-1 text-xs font-light transition-all duration-500  rounded-full rounded-tl-none {node?.operator ==
				'_and'
					? 'text-primary'
					: 'text-accent-focus'}"
				on:click={() => {
					if (node?.operator && !node?.isMain) {
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
			</p>
		</div>
	{:else}
		<div class="pr-2 rounded-box  w-full">
			<div
				class=" transition-color duration-500 rounded-box ringxxx  ring-1xxx    {node?.not
					? ' ring-errorxxx'
					: 'ring-error/0xxx'}"
			>
				<ActiveArgument
					on:contextmenuUsed={() => {
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
				? 'pb-10 border-l-2 border-l-transparent'
				: ' pb-2'} {node?.isMain ? 'overflow-scroll overscroll-contain h-[60vh]' : 'min'} w-full"
			use:dndzone={{
				items: node.items,
				dragDisabled,
				flipDurationMs,
				transformDraggedElement,
				centreDraggedOnCursor: false,
				type
			}}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}
		>
			<!-- WE FILTER THE SHADOW PLACEHOLDER THAT WAS ADDED IN VERSION 0.7.4, filtering this way rather than checking whether 'nodes' have the id became possible in version 0.9.1 -->
			{#each node.items.filter((item) => {
				return item.id !== SHADOW_PLACEHOLDER_ITEM_ID;
			}) as item (item.id)}
				<div animate:flip={{ duration: flipDurationMs }} class="  flex   ">
					<svelte:self
						{type}
						bind:nodes
						node={nodes[item.id]}
						on:changed
						{availableOperators}
						on:childrenStartDrag={startDrag}
						{group}
					/>
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
