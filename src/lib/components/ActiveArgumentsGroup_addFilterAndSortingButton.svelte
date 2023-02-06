<script>
	export let group;
	export let argsInfo;
	export let update_activeArgumentsDataGrouped;
	export let activeArgumentsDataGrouped;
	export let node;
	export let prefix = '';
	export let parent_inputFields;
	export let parent_stepsOfFields;
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	import { getContext, setContext } from 'svelte';
	import Arg from '$lib/components/Arg.svelte';
	import { getRootType } from '$lib/utils/usefulFunctions';
	let dragDisabled = true;
	const hasGroup_argsNode = group.group_argsNode;
	const mainContainerOperator = group.group_argsNode?.mainContainer?.operator;
	const { activeArgumentsDataGrouped_Store } = getContext('QMSWraperContext');
	let rootArgs = argsInfo.filter((arg) => {
		return arg.dd_isRootArg;
	});

	let groupArgsPossibilities;
	if (group.group_isRoot) {
		groupArgsPossibilities = rootArgs;
	} else if (node?.inputFields) {
		groupArgsPossibilities = node?.inputFields;
	} else if (parent_inputFields) {
		groupArgsPossibilities = parent_inputFields;
	} else {
		groupArgsPossibilities = getRootType(null, group.dd_rootName).inputFields;
	}
	console.log({ groupArgsPossibilities });
	let predefinedFirstSteps = group.group_isRoot ? [] : [group.group_name];
</script>

<div class=" ">
	<div class="dropdown dropdown-start ">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<label
			tabindex="0"
			class="btn btn-xs btn-ghost  bi bi-plus-circle p-1  mr-2 overscroll-contain"
		/>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			tabindex="0"
			class="dropdown-content menu p-2  bg-base-100 rounded-box w-max text-sm shadow-2xl overflow-y-auto overscroll-contain  max-h-52 sm:max-h-72 md:max-h-90    max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
		>
			<div
				class="flex flex-col overflow-x-auto overscroll-contain text-sm text-base-content font-normal normal-case min-w-max w-full "
			>
				{#if hasGroup_argsNode}
					{#if node?.isBond || node?.operator == 'list'}
						<button
							class="btn btn-primary btn-xs mt-4 normal-case font-thin text-base sticky top-0"
							on:click={() => {
								let randomNr = Math.random();
								group.group_argsNode[`${randomNr}`] = {
									// inputFields: parent_inputFields,
									// stepsOfFields: parent_stepsOfFields,
									id: randomNr,
									operator: 'bonded',
									not: false,
									isMain: false,
									isBond: true,
									items: []
								};
								if (node?.items) {
									node.items.push({ id: randomNr });
								} else {
									group.group_argsNode['mainContainer'].items.push({ id: randomNr });
								}
							}}
						>
							bonded
						</button>
					{:else}
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

								if (node?.items) {
									node.items.push({ id: randomNr });
								} else {
									group.group_argsNode['mainContainer'].items.push({ id: randomNr });
								}
							}}
						>
							or / and / bonded
						</button>
					{/if}
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
							activeArgumentsDataGrouped_Store.add_activeArgument(
								newArgData,
								group.group_name,
								node?.id
							);
						}}
						on:containerAddRequest={(e) => {
							let newContainerData = e.detail;
							console.log({ newContainerData });
							let randomNr = Math.random();
							console.log('group', group);
							let newContainerDataRootType = getRootType(null, newContainerData.dd_rootName);
							let hasBaseFilterOperators = newContainerDataRootType?.dd_baseFilterOperators;
							let hasNonBaseFilterOperators = newContainerDataRootType?.dd_nonBaseFilterOperators;

							let isListContainer = newContainerData?.dd_kindList;
							let operator = isListContainer ? 'list' : 'bonded';
							if (hasBaseFilterOperators) {
								operator = '_and';
							}
							if (hasNonBaseFilterOperators) {
								operator = 'bonded';
							}

							let isBond = operator == 'bonded';
							group.group_argsNode[`${randomNr}`] = {
								...newContainerData,
								stepsOfFields: [...newContainerData.stepsOfFields, '_and'],
								inputFields: newContainerDataRootType?.inputFields,
								id: randomNr,
								operator,
								not: false,
								isMain: false,
								isBond,
								items: []
							};
							console.log({ newContainerDataRootType });
							console.log({ newContainerData }, [...newContainerData.stepsOfFields, '_and']);
							if (node?.items) {
								node.items.push({ id: randomNr });
							} else {
								group.group_argsNode['mainContainer'].items.push({ id: randomNr });
							}
						}}
					/>
				{/each}
			</div>
		</div>
	</div>
</div>
