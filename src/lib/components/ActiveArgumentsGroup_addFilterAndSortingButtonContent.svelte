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
	const { activeArgumentsDataGrouped_Store } = getContext(`${prefix}QMSWraperContext`);
	let rootArgs = argsInfo.filter((arg) => {
		return arg.dd_isRootArg;
	});

	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	let groupArgsPossibilities;
	if (group.group_isRoot) {
		groupArgsPossibilities = rootArgs;
	} else if (node?.inputFields) {
		groupArgsPossibilities = node?.inputFields;
	} else if (parent_inputFields) {
		groupArgsPossibilities = parent_inputFields;
	} else {
		groupArgsPossibilities = getRootType(null, group.dd_rootName, schemaData).inputFields;
	}
	let baseFilterOperators = ['_and', '_or', '_not']; //!!!this might create problem if there is some nonBase operator with the same name as one of these
	groupArgsPossibilities = groupArgsPossibilities.filter((arg) => {
		return !baseFilterOperators.includes(arg.dd_displayName);
	});
	console.log({ groupArgsPossibilities });
	let predefinedFirstSteps = group.group_isRoot ? [] : [group.group_name];
</script>

<div
	class="flex flex-col overflow-x-auto overscroll-contain text-sm text-base-content font-normal normal-case min-w-max w-full "
>
	{#if hasGroup_argsNode}
		{#if node?.operator == 'bonded' || node?.operator == 'list'}
			<button
				class="btn btn-primary btn-xs  normal-case font-thin text-base sticky top-0"
				on:click={() => {
					let randomNr = Math.random();
					group.group_argsNode[`${randomNr}`] = {
						parent_node: node,
						// inputFields: parent_inputFields,
						// stepsOfFields: parent_stepsOfFields,
						id: randomNr,
						operator: 'bonded',
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
				on:contextmenu|preventDefault={() => {
					let randomNr = Math.random();
					group.group_argsNode[`${randomNr}`] = {
						addDefaultFields: true,
						parent_node: node,
						// inputFields: parent_inputFields,
						// stepsOfFields: parent_stepsOfFields,
						id: randomNr,
						operator: 'bonded',
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
				[item] (bonded)
			</button>
		{:else}
			<button
				class="btn btn-primary btn-xs  normal-case font-thin text-base sticky top-0"
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
				on:contextmenu|preventDefault={() => {
					let randomNr = Math.random();
					group.group_argsNode[`${randomNr}`] = {
						addDefaultFields: true,

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
	<div class="my-2 border-2 rounded-box ">
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
					let newContainerDataRootType = getRootType(
						null,
						newContainerData.dd_rootName,
						schemaData
					);
					let hasBaseFilterOperators = newContainerDataRootType?.dd_baseFilterOperators;
					let NODEhasBaseFilterOperators = getRootType(
						null,
						node.dd_rootName,
						schemaData
					)?.dd_baseFilterOperators;
					let hasNonBaseFilterOperators = newContainerDataRootType?.dd_nonBaseFilterOperators;

					let isListContainer = newContainerData?.dd_kindList;
					let operator;
					if (!operator && isListContainer) {
						operator = 'list';
					}

					if (
						!operator &&
						hasBaseFilterOperators &&
						node.dd_rootName &&
						!NODEhasBaseFilterOperators
					) {
						operator = '_and';
					}

					if (!operator) {
						operator = 'bonded';
					}

					group.group_argsNode[`${randomNr}`] = {
						...newContainerData,
						inputFields: newContainerDataRootType?.inputFields,
						id: randomNr,
						operator,
						not: false,
						isMain: false,
						items: []
					};
					console.log({ newContainerDataRootType });
					console.log({ newContainerData });
					if (node?.items) {
						node.items.push({ id: randomNr });
					} else {
						group.group_argsNode['mainContainer'].items.push({ id: randomNr });
					}
				}}
			/>
		{/each}
	</div>

	<div class="alert alert-info shadow-lg py-2">
		<div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current flex-shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>'_and', '_or', '_not' are hidden.</span>
		</div>
	</div>
</div>
