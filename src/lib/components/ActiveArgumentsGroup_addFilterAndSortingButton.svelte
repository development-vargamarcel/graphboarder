<script>
	import { Create_isDragging_Store } from '../stores/isDragging_Store.ts';
	export let group;
	export let argsInfo;
	export let activeArgumentsData;
	export let update_activeArgumentsDataGrouped;
	export let activeArgumentsDataGrouped;
	let showDescription;
	export let prefix = '';
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	import { getContext, setContext } from 'svelte';
	import Arg from './Arg.svelte';
	let dragDisabled = true;
	const hasGroup_argsNode = group.group_argsNode;
	setContext('isDraggingStore', Create_isDragging_Store());
	const activeArgumentsDataGrouped_Store = getContext(`${prefix}activeArgumentsDataGrouped_Store`);
	let rootArgs = argsInfo.filter((arg) => {
		return arg.dd_isRootArg;
	});
	let groupArgsPossibilities = group.group_isRoot ? group.dd_relatedRoot.inputFields : rootArgs;
	let predefinedFirstSteps = group.group_isRoot ? [] : [group.group_name];
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
						{#if hasGroup_argsNode}
							<button
								class="btn btn-primary btn-xs mt-4 normal-case font-thin text-base sticky top-0"
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
								or / and / bonded
							</button>
						{/if}
						{#each groupArgsPossibilities as arg, index}
							<Arg
								{index}
								type={arg}
								template="changeArguments"
								{predefinedFirstSteps}
								groupName={group.group_name}
								on:argAddRequest={(e) => {
									let newArgData = e.detail;
									activeArgumentsDataGrouped_Store.add_activeArgument(newArgData, group.group_name);
								}}
							/>
						{/each}
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
