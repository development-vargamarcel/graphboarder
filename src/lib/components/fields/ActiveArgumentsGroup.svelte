<script>
	import ActiveArgument from '../ActiveArgument.svelte';

	import Arg from '../Arg.svelte';

	export let group;
	export let argsInfo;
	export let activeArgumentsData;
	export let update_activeArgumentsDataGrouped;
	let showDescription;
	export let generate_final_gqlArgObj;
	export let delete_activeArgument;
	export let activeArgumentsDataGrouped;
	export let selectedForEdit;

	//

	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, SOURCES, TRIGGERS } from 'svelte-dnd-action';
	import { fade } from 'svelte/transition';
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	import { cubicIn } from 'svelte/easing';
	import { flip } from 'svelte/animate';
	import { createEventDispatcher } from 'svelte';
	import ActiveArgumentGroupHasFilterOperators from '../ActiveArgumentGroupHasFilterOperators.svelte';
	const flipDurationMs = 200;
	let dragDisabled = true;
	const dispatch = createEventDispatcher();
	function handleSort(e) {
		group.group_args = e.detail.items;
		console.log('choisesWithId', group.group_args);

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
</script>

<div class="bg-base-100 p-2 rounded-box">
	<div class="font-bold flex">
		<div class=" ">
			<div class="dropdown dropdown-start ">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label
					tabindex="0"
					class="btn btn-sm bi bi-plus-circle text-lg p-1 mr-2 overscroll-contain"
				/>
				<div
					tabindex="0"
					class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-max text-sm shadow-2xl overflow-y-auto overscroll-contain  max-h-52 sm:max-h-72 md:max-h-90    max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
				>
					<div
						class="flex flex-col overflow-x-auto overscroll-contain text-sm font-normal normal-case min-w-max w-full "
					>
						{#if group?.dd_relatedRoot?.inputFields}
							{#each group?.dd_relatedRoot?.inputFields as arg, index}
								<Arg
									{index}
									type={arg}
									template="changeArguments"
									predefinedFirstSteps={[group.group_name]}
									on:argAddRequest={(e) => {
										let newArgData = e.detail;

										if (group.group_argsNode) {
											//to prevent --> Uncaught TypeError: Converting circular structure to JSON
											newArgData.dd_relatedRoot =
												'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON';
											newArgData.not = false;
											group.group_argsNode[newArgData.id] = newArgData;
											group.group_argsNode.mainContainer.items.push({ id: newArgData.id });
										} else {
											if (
												!group.group_args.some((el) => {
													return (
														el.stepsOfFieldsNewStringified == newArgData.stepsOfFieldsNewStringified
													);
												})
											) {
												group.group_args.push(newArgData);
												console.log('aa group', group);
												update_activeArgumentsDataGrouped(group);
											} else {
												console.log('already added');
											}
										}
									}}
								/>
							{/each}
							{#if hasGroup_argsNode}
								<button
									class="btn btn-primary btn-sm"
									on:click={() => {
										let randomNr = Math.random();
										group.group_argsNode[`${randomNr}`] = {
											id: randomNr,
											operator: '_or',
											not: false,
											isMain: false,
											items: []
										};
										group.group_argsNode['mainContainer'].items.push({ id: randomNr });
									}}
								>
									OR/And group
								</button>
							{/if}
						{:else}
							{#each argsInfo.filter((arg) => {
								return arg.dd_isRootArg;
							}) as arg, index}
								<Arg
									{index}
									type={arg}
									template="changeArguments"
									predefinedFirstSteps={[]}
									on:argAddRequest={(e) => {
										let newArgData = e.detail;
										if (
											!group.group_args.some((el) => {
												return (
													el.stepsOfFieldsNewStringified == newArgData.stepsOfFieldsNewStringified
												);
											})
										) {
											group.group_args.push(newArgData);
											update_activeArgumentsDataGrouped(group);
										} else {
											console.log('already added');
										}
									}}
								/>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
		{#if !group.group_isRoot}
			{group.group_name}
		{/if}
		{#if group.dd_kindList}
			(list)
		{/if}
		{#if group?.dd_relatedRoot?.dd_filterOperators}
			{`(${group?.dd_relatedRoot?.dd_filterOperators?.join(',')})`}
		{/if}
		{#if group.group_name !== 'root'}
			<i
				class="bi bi-info-circle text-secondary px-2"
				title={group.description}
				on:click={() => {
					if (showDescription == group.description) {
						showDescription = '';
					} else {
						showDescription = group.description;
					}
				}}
			/>
			{#if showDescription == group.description && group.description}
				<p class="text-xs font-light text-secondary select-none">
					({group.description})
				</p>
			{/if}{/if}
	</div>
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
				<div
					tabindex={dragDisabled ? 0 : -1}
					aria-label="drag-handle"
					class="bi bi-grip-vertical pt-3 px-2"
					style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
					on:mousedown={startDrag}
					on:touchstart={startDrag}
					on:keydown={handleKeyDown}
				/>
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
						on:selectedForEditChanged={(e) => {
							let { detail } = e;
							console.log('detail.selectedForEditOn', detail.selectedForEditOn);
							if (detail.selectedForEditOn) {
								if (!selectedForEdit.includes(detail.selectedForEditValue)) {
									selectedForEdit = [...selectedForEdit, detail.selectedForEditValue];
								}
							} else {
								selectedForEdit = selectedForEdit.filter((el) => {
									return el !== detail.selectedForEditValue;
								});
							}
						}}
						on:inUseChanged={() => {
							update_activeArgumentsDataGrouped(group);
						}}
						on:delete_activeArgument={() => {
							group.group_args = group.group_args.filter((arg) => {
								return arg.id !== activeArgumentData.id;
							});
						}}
						{activeArgumentData}
						{group}
						{generate_final_gqlArgObj}
						{delete_activeArgument}
						{activeArgumentsDataGrouped}
						{activeArgumentsData}
					/>
				</div>
			</div>
		{/each}
	</ul>
</div>

{#if hasGroup_argsNode}
	<!-- overflow-scroll overscroll-contain h-[75vh] -->
	<div class=" ">
		<ActiveArgumentGroupHasFilterOperators
			node={group.group_argsNode.mainContainer}
			{group}
			bind:nodes={group.group_argsNode}
			on:changed={() => {
				let nodesClone = JSON.parse(JSON.stringify(group.group_argsNode));
				let values = Object.values(nodesClone);
				let valuesWithItems = values.filter((node) => {
					return node?.items?.length > 0;
				});
				console.log('group.group_argsNode', group.group_argsNode);
				console.log({ values });
				console.log({ valuesWithItems });
			}}
		/>
	</div>
{/if}
