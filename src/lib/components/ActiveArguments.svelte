<script lang="ts">
	import DNDExample from './DNDExample.svelte';
	import ActiveArgument from './ActiveArgument.svelte';
	import {
		generate_FINAL_gqlArgObj_fromGroups,
		get_NamesArray
	} from './../utils/usefulFunctions.js';
	import {
		generate_final_gqlArgObjTEST,
		generate_gqlArgObj,
		get_KindsArray
	} from '$lib/utils/usefulFunctions';
	import { scalarsAndEnumsDisplayTypes } from '$lib/stores/scalarsAndEnumsDisplayTypes';
	import FilterChoises from '$lib/components/FilterChoises.svelte';
	import FilterGroup from './FilterGroup.svelte';
	import FilterItem from './FilterItem.svelte';
	import { createEventDispatcher, each } from 'svelte/internal';
	import Input from './fields/Input.svelte';
	import Textarea from './fields/Textarea.svelte';
	import Modal from './Modal.svelte';
	import Toggle from './fields/Toggle.svelte';
	import Arg from './Arg.svelte';
	import ActiveArgumentsGroup from './ActiveArgumentsGroup.svelte';
	let _scalarsAndEnumsDisplayTypes = $scalarsAndEnumsDisplayTypes;
	let activeArgumentsDataGrouped = [];
	const update_activeArgumentsDataGrouped = (groupNewData) => {
		let index = activeArgumentsDataGrouped.findIndex((group) => {
			return group.group_name == groupNewData.group_name;
		});
		activeArgumentsDataGrouped[index] = groupNewData;
		activeArgumentsDataGrouped = activeArgumentsDataGrouped;
		console.log('groupNewData.group_args', groupNewData.group_args);
		console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
	};
	let showActiveFilters;
	const dispatch = createEventDispatcher();
	let showModal = false;
	export let overwrite_activeArgumentsData;
	export let delete_activeArgument;
	export let argsInfo;
	console.log('argsInfo', argsInfo);
	const handleArgsChanged = () => {};
	let final_gqlArgObj = {};
	let final_canRunQuery = true;

	const generate_final_gqlArgObj = () => {
		let { final_gqlArgObj, final_gqlArgObj_string, final_canRunQuery } =
			generate_FINAL_gqlArgObj_fromGroups(activeArgumentsDataGrouped);
		if (final_canRunQuery) {
			dispatch('argsChanged', {
				gqlArgObj: final_gqlArgObj,
				gqlArgObj_string: final_gqlArgObj_string
			});
		}
	};

	//handle generating activeArgumentsDataGrouped
	let rootGroup = { group_name: 'root', group_isRoot: true, dd_kindList: false, group_args: [] };
	activeArgumentsDataGrouped = [rootGroup];

	argsInfo?.forEach((el) => {
		console.log('el---', el);
		if (!el.dd_isRootArg) {
			let newGroupData = {
				group_name: el.dd_displayName,
				group_isRoot: false,
				// group_info: el,
				...el,
				group_args: []
			};

			const hasFilterOperators = el.dd_relatedRoot?.dd_filterOperators?.length > 0;

			if (hasFilterOperators) {
				newGroupData.group_argsNode = {
					mainContainer: {
						operator: '_and',
						isMain: true,
						not: false,
						items: [],
						id: 'mainContainer'
					}
				};
			}

			activeArgumentsDataGrouped.push(newGroupData);
		}
	});

	console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);

	//

	/////generate gqlArgObj to be used in query

	generate_final_gqlArgObj();

	let showDescription = null;
</script>

{#if showModal}
	<Modal
		modalIdetifier={'activeArgumentsDataModal'}
		showApplyBtn={false}
		on:cancel={(e) => {
			let { detail } = e;
			if (detail.modalIdetifier == 'activeArgumentsDataModal') {
				showModal = false;
			}
		}}
		on:apply={(e) => {
			console.log(']]]]]]]]]', e);
		}}
		><div class="  w-full  ">
			<div class="mx-auto mt-2  w-full   space-y-2   pb-2  ">
				<div class="w-2" />

				{#each activeArgumentsDataGrouped as group}
					<ActiveArgumentsGroup
						on:updateQuery={() => {
							generate_final_gqlArgObj();
						}}
						{update_activeArgumentsDataGrouped}
						{group}
						{argsInfo}
						{overwrite_activeArgumentsData}
						{showDescription}
						{delete_activeArgument}
						{activeArgumentsDataGrouped}
					/>
				{/each}

				<div class="w-2" />
			</div>
		</div>
	</Modal>
{/if}

<div class="flex space-x-2 mb-2 px-2">
	<button
		class="btn btn-xs btn-block  "
		on:click={() => {
			showModal = !showModal;
			//showActiveFilters = !showActiveFilters;
			showActiveFilters = true;
		}}
		><i class="bi bi-funnel-fill" />
	</button>
</div>
