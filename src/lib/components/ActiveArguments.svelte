<script lang="ts">
	import ActiveArgument from './ActiveArgument.svelte';
	import { get_NamesArray } from './../utils/usefulFunctions.ts';
	import { get_KindsArray } from '$lib/utils/usefulFunctions';
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
	import ActiveArgumentsGroup from './fields/ActiveArgumentsGroup.svelte';
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
		final_gqlArgObj = {};
		final_canRunQuery = true;
		activeArgumentsDataGrouped.forEach((group) => {
			let group_argumentsData = group.group_args.filter((arg) => {
				return arg.inUse;
			});

			if (group_argumentsData?.length > 0) {
				console.log('group_argumentsData', group_argumentsData);

				if (group.group_isRoot) {
					console.log('root group handled');
					let { gqlArgObj, canRunQuery } = generate_gqlArgObj(group_argumentsData);
					final_gqlArgObj = { ...final_gqlArgObj, ...gqlArgObj };
					if (canRunQuery == false) {
						final_canRunQuery = false;
					}
				} else {
					console.log('NON root group handled');
					if (group.dd_kindList) {
						let list = [];
						list = group_argumentsData.map((arg) => {
							let { gqlArgObj, canRunQuery } = generate_gqlArgObj([arg]);
							console.log('-=-=-canRunQuery', canRunQuery);
							if (canRunQuery == false) {
								//will give off not good results for canRunQuery,must change handling in generate_gqlArgObj
								final_canRunQuery = false;
							}
							return gqlArgObj[group.group_name];
						});
						final_gqlArgObj[group.group_name] = list;
						final_gqlArgObj = { ...final_gqlArgObj };
						console.log('list---', list);
					} else {
						let { gqlArgObj, canRunQuery } = generate_gqlArgObj(group_argumentsData);
						final_gqlArgObj = { ...final_gqlArgObj, ...gqlArgObj };
						if (canRunQuery == false) {
							final_canRunQuery = false;
						}
					}
				}
			}
		});
		//handle root group

		let final_gqlArgObj_string = JSON.stringify(final_gqlArgObj)
			.replace(/"/g, '')
			.replace(/'/g, `"`)
			.slice(1, -1);
		console.log('final_gqlArgObj_string', final_gqlArgObj_string);
		if (final_canRunQuery) {
			dispatch('argsChanged', {
				gqlArgObj: final_gqlArgObj,
				gqlArgObj_string: final_gqlArgObj_string
			});
		}
	};
	const generate_gqlArgObj = (group_argumentsData) => {
		// check for group if expects list and treat it accordingly like here --->https://stackoverflow.com/questions/69040911/hasura-order-by-date-with-distinct
		let gqlArgObj = {};
		let canRunQuery = true;
		group_argumentsData.forEach((argData) => {
			if (argData.inUse) {
				let { chd_chosen, chd_dispatchValue, chd_needsValue, chd_needsChosen, stepsOfFieldsNew } =
					argData;

				let curr_gqlArgObj = gqlArgObj;
				stepsOfFieldsNew.forEach((step, index) => {
					let isLast = index == stepsOfFieldsNew.length - 1;
					if (isLast) {
						console.log('chd_needsValue', chd_needsValue);
						if (!chd_needsChosen) {
							if (!curr_gqlArgObj?.[step]) {
								curr_gqlArgObj[step] = chd_dispatchValue;
							}
							curr_gqlArgObj = curr_gqlArgObj[step];
						} else {
							if (chd_needsValue == undefined) {
								canRunQuery = false;
								console.log('canRunQuery = false', canRunQuery);
							} else if (!chd_needsValue) {
								curr_gqlArgObj[step] = chd_chosen;
								if (!(Array.isArray(chd_chosen) || typeof chd_chosen == 'string')) {
									canRunQuery = false;
									console.log('canRunQuery = false', canRunQuery);
								}
							} else {
								console.log('chd_dispatchValue', chd_dispatchValue);
								console.log('!chd_dispatchValue', !chd_dispatchValue);

								if (!curr_gqlArgObj?.[step]) {
									curr_gqlArgObj[step] = {};
								}
								curr_gqlArgObj = curr_gqlArgObj[step];

								curr_gqlArgObj[chd_chosen] =
									chd_dispatchValue !== undefined ? chd_dispatchValue : '';
								curr_gqlArgObj = curr_gqlArgObj[chd_chosen];

								console.log('----curr_gqlArgObj', curr_gqlArgObj);
								if (chd_dispatchValue == undefined) {
									canRunQuery = false;
									console.log('canRunQuery = false', canRunQuery);
								}
							}
						}
					} else {
						if (!curr_gqlArgObj?.[step]) {
							curr_gqlArgObj[step] = {};
						}
						curr_gqlArgObj = curr_gqlArgObj[step];
					}
				});
				console.log('curr_gqlArgObj', curr_gqlArgObj);
			}
		});

		console.log('gqlArgObj', gqlArgObj);
		console.log('canRunQuery', canRunQuery);

		return { gqlArgObj, canRunQuery };
	};

	//handle generating activeArgumentsDataGrouped
	let rootGroup = { group_name: 'root', group_isRoot: true, dd_kindList: false, group_args: [] };
	activeArgumentsDataGrouped = [rootGroup];
	argsInfo.forEach((el) => {
		console.log('el---', el);
		if (!el.dd_isRootArg) {
			activeArgumentsDataGrouped.push({
				group_name: el.dd_displayName,
				group_isRoot: false,
				// group_info: el,
				...el,
				group_args: []
			});
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
						{generate_final_gqlArgObj}
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
		class="btn btn-xs  "
		on:click={() => {
			showModal = !showModal;
			//showActiveFilters = !showActiveFilters;
			showActiveFilters = true;
		}}
		>show active filters
	</button>
</div>
