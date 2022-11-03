<script>
	import ActiveArgumentsGroupNormal from './ActiveArgumentsGroupNormal.svelte';

	import { Create_isDragging_Store } from './../stores/isDragging_Store.ts';
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
	setContext('isDraggingStore', Create_isDragging_Store());
</script>

<div class="bg-base-100 p-2 rounded-box">
	<div class="font-bold flex">
		<div class=" ">
			<div class="dropdown dropdown-start ">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<label
					tabindex="0"
					class="btn btn-sm bi bi-plus-circle text-lg p-1 mr-2 overscroll-contain"
				/>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
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
									groupName={group.group_name}
									on:argAddRequest={(e) => {
										let newArgData = e.detail;

										if (group.group_argsNode) {
											if (newArgData?.dd_NON_NULL) {
												console.log(newArgData?.dd_NON_NULL);
												//to prevent --> Uncaught TypeError: Converting circular structure to JSON
												newArgData.dd_relatedRoot =
													'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON';
												newArgData.not = false;
												group.group_argsNode[newArgData.id] = newArgData;
												let randomNr = Math.random();
												group.group_argsNode[`${randomNr}`] = {
													id: randomNr,
													operator: '_and',
													not: false,
													isMain: false,
													isBond: true,
													items: []
												};
												group.group_argsNode['mainContainer'].items.push({ id: randomNr });
												group.group_argsNode[`${randomNr}`].items.push({ id: newArgData.id });
											} else {
												//to prevent --> Uncaught TypeError: Converting circular structure to JSON
												newArgData.dd_relatedRoot =
													'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON';
												newArgData.not = false;
												group.group_argsNode[newArgData.id] = newArgData;
												group.group_argsNode.mainContainer.items.push({ id: newArgData.id });
											}
										} else {
											if (
												!group.group_args.some((el) => {
													return (
														el.stepsOfFieldsNewStringified == newArgData.stepsOfFieldsNewStringified
													);
												})
											) {
												group.group_args.push(newArgData);
												//console.log('aa group', group);
												update_activeArgumentsDataGrouped(group);
											} else {
												//console.log('already added');
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
									groupName={group.group_name}
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
											//console.log('already added');
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
			<!-- svelte-ignore a11y-click-events-have-key-events -->
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
</div>

{#if hasGroup_argsNode}
	<div class=" ">
		<ActiveArgumentsGroupHasFilterOperators
			on:updateQuery={() => {
				let gqlArgObj_forHasOperators = generate_gqlArgObj_forHasOperators(
					group.group_argsNode,
					group.group_name
				);
				Object.assign(group, gqlArgObj_forHasOperators);
				let FINAL_gqlArgObj_fromGroups = generate_FINAL_gqlArgObj_fromGroups(
					activeArgumentsDataGrouped
				);
				dispatch('updateQuery');
				//console.log({ FINAL_gqlArgObj_fromGroups });
				group.group_args = Object.values(group.group_argsNode)?.filter((node) => {
					return !node?.operator;
				});
				update_activeArgumentsDataGrouped(group);
			}}
			type={group.group_name + 'ActiveArgumentsGroupHasFilterOperators'}
			node={group.group_argsNode.mainContainer}
			originalNodes={group.group_argsNode}
			{group}
			bind:nodes={group.group_argsNode}
			on:changed={() => {
				let gqlArgObj_forHasOperators = generate_gqlArgObj_forHasOperators(
					group.group_argsNode,
					group.group_name
				);
				Object.assign(group, gqlArgObj_forHasOperators);
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
		on:changed
		on:updateQuery
		bind:group
		bind:argsInfo
		bind:activeArgumentsData
		bind:update_activeArgumentsDataGrouped
		bind:activeArgumentsDataGrouped
	/>
{/if}
