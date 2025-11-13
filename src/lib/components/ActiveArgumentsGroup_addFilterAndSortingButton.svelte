<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import Arg from '$lib/components/Arg.svelte';
	import { getQMSWraperCtxDataGivenControlPanelItem } from '$lib/utils/usefulFunctions';

	interface Props {
		group: any;
		argsInfo: any;
		update_activeArgumentsDataGrouped: any;
		activeArgumentsDataGrouped: any;
		prefix?: string;
		node: any;
	}

	let {
		group = $bindable(),
		argsInfo,
		update_activeArgumentsDataGrouped,
		activeArgumentsDataGrouped,
		prefix = '',
		node
	}: Props = $props();

	let showDescription = $state();
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	let dragDisabled = true;
	const hasGroup_argsNode = group.group_argsNode;
	/////start
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	let pathIsInCP = false;
	const nodeContext = getContext(`${prefix}nodeContext`);
	if (nodeContext) {
		pathIsInCP = nodeContext?.pathIsInCP;
	}
	let nodeIsInCP = false;
	const CPItemContext = getContext(`${prefix}CPItemContext`);
	if (CPItemContext?.CPItem.nodeId == node.id) {
		setContext(`${prefix}nodeContext`, { pathIsInCP: true });
		nodeIsInCP = true;
	}
	const isCPChild = CPItemContext ? true : false;
	const visibleInCP = pathIsInCP || nodeIsInCP;
	const visible = visibleInCP || !CPItemContext || node.isMain;
	let correctQMSWraperContext;
	if (isCPChild) {
		correctQMSWraperContext = getQMSWraperCtxDataGivenControlPanelItem(
			CPItemContext?.CPItem,
			OutermostQMSWraperContext
		);
	} else {
		correctQMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	}
	const { finalGqlArgObj_Store, QMS_info, activeArgumentsDataGrouped_Store } =
		correctQMSWraperContext;
	/////end
	let rootArgs = argsInfo.filter((arg) => {
		return arg.dd_isRootArg;
	});

	let groupArgsPossibilities = group.group_isRoot
		? rootArgs
		: group.dd_relatedRoot.inputFields || group.inputFields || group.args;
	let predefinedFirstSteps = group.group_isRoot ? [] : [group.group_name];
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
</script>

<div class="bg-base-100  rounded-box">
	<div class="font-bold flex">
		<div class=" ">
			<div class="dropdown dropdown-start ">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<label
					tabindex="0"
					class="btn btn-sm btn-ghost bi bi-plus-circle text-lg p-1 mr-2 overscroll-contain"
				></label>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
								onclick={() => {
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
									activeArgumentsDataGrouped_Store.add_activeArgument(
										newArgData,
										group.group_name,
										undefined,
										endpointInfo
									);
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
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<i
				class="bi bi-info-circle text-secondary px-2"
				title={group.description}
				onclick={() => {
					if (showDescription == group.description) {
						showDescription = '';
					} else {
						showDescription = group.description;
					}
				}}
			></i>
			{#if showDescription == group.description && group.description}
				<p class="text-xs font-light text-secondary select-none">
					({group.description})
				</p>
			{/if}{/if}
	</div>
</div>
