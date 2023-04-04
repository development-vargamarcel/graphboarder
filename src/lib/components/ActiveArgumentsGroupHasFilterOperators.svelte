<script>
	//!!! chnage bonded to item
	import { flip } from 'svelte/animate';
	import { dndzone, SHADOW_PLACEHOLDER_ITEM_ID } from 'svelte-dnd-action';
	import { createEventDispatcher, getContext } from 'svelte';
	import ActiveArgument from '$lib/components/ActiveArgument.svelte';
	import ActiveArgumentsGroup_addFilterAndSortingButtonContent from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButtonContent.svelte';
	import Modal from './Modal.svelte';
	import { getFields_Grouped, nodeAddDefaultFields } from '$lib/utils/usefulFunctions';

	const dispatch = createEventDispatcher();
	export let nodes;
	export let node;
	export let availableOperators;
	export let group;
	export let type;
	export let originalNodes;
	export let parent_inputFields;
	export let parent_stepsOfFields;
	export let addDefaultFields;
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	let dragDisabled = true;
	const flipDurationMs = 500;
	function handleDndConsider(e) {
		//console.log('considering', e, nodes);
		node.items = e.detail.items;
		dragDisabled = true;
	}
	function handleDndFinalize(e) {
		node.items = e.detail.items;
		//console.log(e);
		nodes = { ...nodes };
		handleChanged();
		dispatch('changed');
		dragDisabled = true;
	}

	const deleteItem = (e) => {
		node.items = node.items.filter((item) => {
			return item.id !== e.detail.id;
		});
		// nodes[e.detail.id] = undefined;
		//!!! to do: also delete the node from "nodes"
		nodes = { ...nodes };
		handleChanged();
		dispatch('changed');
	};
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

	//$: console.log(shadowEl);
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
		draggedEl?.classList.add('bg-accent/25', 'border-2', 'border-accent');
		draggedEl
			.querySelector('.dnd-item')
			?.classList.add('bg-accent/25', 'border-2', 'border-accent');
	};
	//
	const dragDisabledConstantTest = true;

	const { finalGqlArgObj_Store, QMS_info, activeArgumentsDataGrouped_Store } = getContext(
		`${prefix}QMSWraperContext`
	);
	const handleChanged = () => {
		finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};

	let argsInfo = QMS_info?.args;
	let showModal = false;
	const dndIsOn = getContext('dndIsOn');
	const mutationVersion = getContext('mutationVersion');

	let groupDisplayTitle = '';
	$: {
		groupDisplayTitle = '';

		if (node?.stepsOfFields) {
			groupDisplayTitle = groupDisplayTitle + node?.stepsOfFields.slice(1);
		} else if (parent_stepsOfFields) {
			// groupDisplayTitle = groupDisplayTitle + `(${parent_stepsOfFields.slice(1)})`;
			// //groupDisplayTitle = groupDisplayTitle + `[item]`; //bonded
		}

		if (node?.operator != 'bonded') {
			if (groupDisplayTitle.trim() != '') {
				groupDisplayTitle = `${groupDisplayTitle},`;
			}
			groupDisplayTitle = `${groupDisplayTitle}${node?.operator}`;
			if (['_and', '_or'].includes(node?.operator)) {
				groupDisplayTitle = `${groupDisplayTitle},list`;
			}
		}
		if (groupDisplayTitle.trim() == '') {
			groupDisplayTitle = '[item]'; //bonded
		}
	}

	if (node?.addDefaultFields || (node.isMain && addDefaultFields)) {
		nodeAddDefaultFields(node, prefix, group, activeArgumentsDataGrouped_Store, schemaData);
	}
	let showSelectModal = false;
</script>

{#if showModal}
	<Modal
		showApplyBtn={false}
		on:cancel={() => {
			showModal = false;
		}}
	>
		<div class="flex flex-col ">
			<div class="w-full text-lg text-center  mb-2 ">
				<p class="badge badge-info font-bold">
					{groupDisplayTitle}
				</p>
			</div>

			{#if node?.isMain}
				<btn
					class="btn btn-xs btn-info normal-case  mb-6 flex-1"
					on:click={() => {
						nodeAddDefaultFields(node, prefix, group, activeArgumentsDataGrouped_Store, schemaData);
					}}
				>
					addDefaultFields
				</btn>
			{/if}

			{#if !node?.isMain}
				<div class="flex space-x-4 ">
					<div class="form-control mr-1">
						<label class="label cursor-pointer w-min py-0">
							<span class="label-text pr-1">Not</span>
							<input
								type="checkbox"
								class="toggle toggle-sm"
								checked={node.not}
								on:change|preventDefault|stopPropagation={() => {
									if (!node?.isMain) {
										node.not = !node.not;
										handleChanged();
										dispatch('changed');
									}
								}}
							/>
						</label>
					</div>

					<btn
						class="btn btn-xs btn-info  normal-case mb-6 flex-1"
						on:click={() => {
							nodeAddDefaultFields(
								node,
								prefix,
								group,
								activeArgumentsDataGrouped_Store,
								schemaData
							);
						}}
					>
						addDefaultFields
					</btn>

					<btn
						class="btn btn-xs text-sm mb-1 normal-case flex-1"
						on:click={() => {
							if (node?.operator && !node?.isMain) {
								if (node?.operator == '_or') {
									node.operator = '_and';
								} else if (node?.operator == '_and') {
									node.operator = 'bonded';
								} else if (node?.operator == 'bonded') {
									node.operator = 'list';
								} else {
									node.operator = '_or';
								}
							}
							handleChanged();
							dispatch('changed');
						}}
					>
						change
					</btn>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<btn
						class="btn btn-xs btn-warning  mb-6 flex-1"
						on:click={() => {
							alert('not yet implemented');
							console.log(
								'not yet implemented,implement here.Delete node and his items and items of his items recursively until the very end of the tree.'
							);
						}}
					>
						<i class="bi bi-trash-fill" />
					</btn>
				</div>
			{/if}
			<div>
				<ActiveArgumentsGroup_addFilterAndSortingButtonContent
					{parent_inputFields}
					{parent_stepsOfFields}
					on:updateQuery
					bind:group
					bind:argsInfo
					{node}
				/>
			</div>
		</div>
	</Modal>{/if}
{#if showSelectModal}
	<Modal
		showApplyBtn={false}
		on:cancel={() => {
			showSelectModal = false;
		}}
	>
		<div class="flex flex-col ">
			<div class="w-full text-lg text-center  mb-2 ">
				<p class="badge badge-info font-bold">
					{groupDisplayTitle}
				</p>
			</div>

			{#if node?.isMain}
				<btn
					class="btn btn-xs btn-info normal-case  mb-6 flex-1"
					on:click={() => {
						nodeAddDefaultFields(node, prefix, group, activeArgumentsDataGrouped_Store, schemaData);
					}}
				>
					addDefaultFields
				</btn>
			{/if}
		</div>
	</Modal>{/if}

{#if !node?.isMain}
	<div class="   grid   content-center  rounded-full w-min-max w-max">
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div class="flex ">
			{#if $dndIsOn}
				<div
					tabindex={dragDisabled ? 0 : -1}
					aria-label="drag-handle"
					class="  transition:all duration-500 bi bi-grip-vertical ml-2  -mr-1 text-lg rounded-l-md {node?.operator ==
						undefined || node?.operator == 'bonded'
						? 'text-base-content'
						: node?.operator == '_and'
						? 'text-primary'
						: 'text-accent-focus'} 
						{node?.not ? ' bg-gradient-to-r== from-base-300/100==' : 'bg-error/0'}
						"
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
						//
					}}
				/>
			{/if}
			<!-- node?.items?.length <= 1 -->
			{#if node?.operator && !$mutationVersion}
				<div
					tabindex="0"
					class="btn btn-xs btn-ghost px-[1px] text-xs font-light transition-all duration-500  rounded-full  normal-case   {node?.operator ==
						'bonded' || node?.operator == 'list'
						? 'text-base-content'
						: node?.operator == '_and'
						? 'text-primary'
						: 'text-accent-focus'} break-all h-max  w-max
						{node?.not ? ' bg-gradient-to-r from-secondary/50' : 'bg-error/0'}
						"
					on:click={() => {
						showModal = true;
					}}
					on:contextmenu|preventDefault|stopPropagation={() => {
						//
					}}
				>
					{groupDisplayTitle}
					{#if node.dd_NON_NULL}
						<sup>
							<i class="text-primary bi bi-asterisk" />
						</sup>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<div
	class="  w-min-max w-max transition-all duration-500
	
	
	{node?.operator && (node.items.length > 1 || ($mutationVersion && node.items.length >= 1))
		? 'rounded-l-md bg-gradient-to-rxxx   border-l-[1px] my-1== shadow-sm'
		: ''} 
	{node?.isMain ? '  rounded-l-md bg-gradient-to-rxxx   border-l-[2px] my-1== shadow-sm' : ''}
{node?.operator && node?.not ? 'border-dashed  ' : ''} 
{node?.operator == 'bonded' || node?.operator == 'list'
		? 'border-base-content'
		: node?.operator == '_and'
		? 'border-primary'
		: 'border-accent-focus '}


"
	on:contextmenu|preventDefault|stopPropagation={() => {
		//
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
		{#if $mutationVersion && !node?.isMain}
			<div
				tabindex="0"
				class="btn btn-xs btn-ghost px-[1px] text-xs font-light transition-all duration-500  rounded-full  normal-case   {node?.operator ==
					'bonded' || node?.operator == 'list'
					? 'text-base-content'
					: node?.operator == '_and'
					? 'text-primary'
					: 'text-accent-focus'} break-all h-max  w-max
						{node?.not ? ' bg-gradient-to-r from-secondary/50' : 'bg-error/0'}
						"
				on:click={() => {
					showModal = true;
				}}
				on:contextmenu|preventDefault|stopPropagation={() => {
					//
				}}
			>
				{groupDisplayTitle}
				{#if node.dd_NON_NULL}
					<sup>
						<i class="text-primary bi bi-asterisk" />
					</sup>
				{/if}
			</div>
			<button
				class="btn btn-xs normal-case"
				on:click={() => {
					showSelectModal = true;
				}}>select</button
			>
		{/if}
		<div class="flex ">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- node?.items?.length > 1 || node?.isMain -->
			{#if node?.isMain}
				<div
					tabindex="0"
					class="btn btn-xs btn-ghost px-[1px] text-xs font-light transition-all duration-500  rounded-full  normal-case   {node?.operator ==
						'bonded' || node?.operator == 'list'
						? 'text-base-content'
						: node?.operator == '_and'
						? 'text-primary'
						: 'text-accent-focus'} break-all h-max  w-max"
					on:click={() => {
						showModal = true;
					}}
				>
					{groupDisplayTitle}
					{#if node.dd_NON_NULL}
						<sup>
							<i class="text-primary bi bi-asterisk" />
						</sup>
					{/if}
				</div>
			{/if}
			<p class="grow" />
		</div>
	{:else}
		<div class="pr-2 rounded-box  w-full">
			<div class=" transition-color duration-500 rounded-box ringxxx  ring-1xxx    ">
				<ActiveArgument
					on:contextmenuUsed={() => {
						if (!node?.isMain) {
							node.not = !node.not;
							handleChanged();
							dispatch('changed');
						}
					}}
					isNot={node.not}
					on:updateQuery
					on:inUseChanged={() => {}}
					activeArgumentData={node}
					{group}
				/>
			</div>
		</div>
	{/if}

	{#if node.hasOwnProperty('items')}
		<section
			class=" duration-500 {$dndIsOn
				? '  min-h-[30px] min-w-[200px]'
				: 'pl-1'} rounded-l-none  {node?.isMain
				? ' border-l-2 border-l-transparent  min-h-[40vh] md:min-h-[60vh] '
				: ' '}
				 w-full"
			use:dndzone={{
				items: node.items,
				dragDisabled,
				flipDurationMs,
				transformDraggedElement,
				centreDraggedOnCursor: true,
				type
			}}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}
		>
			<!-- WE FILTER THE SHADOW PLACEHOLDER THAT WAS ADDED IN VERSION 0.7.4, filtering this way rather than checking whether 'nodes' have the id became possible in version 0.9.1 -->
			{#if node.items.length > 1 || node?.isMain || true}
				{#each node.items.filter((item) => {
					return item.id !== SHADOW_PLACEHOLDER_ITEM_ID;
				}) as item (item.id)}
					<div animate:flip={{ duration: flipDurationMs }} class="    border-2== max-w-min my-1 ">
						<div class="flex dnd-item">
							<svelte:self
								on:deleteSubNode={(e) => {
									deleteItem(e);
									//console.log(e.detail.id, node);
								}}
								parent_inputFields={node?.inputFields}
								parent_stepsOfFields={node?.stepsOfFields}
								{originalNodes}
								on:updateQuery
								{type}
								bind:nodes
								node={nodes[item.id]}
								on:changed
								{availableOperators}
								on:childrenStartDrag={startDrag}
								{group}
							/>
						</div>
					</div>
				{/each}
			{/if}
		</section>
	{/if}
</div>
{#if node.id == SHADOW_PLACEHOLDER_ITEM_ID}
	<div class=" ml-8 h-0     top-0 left-0 visible" id="shadowEl" bind:this={shadowEl} />
{/if}

<style>
</style>
