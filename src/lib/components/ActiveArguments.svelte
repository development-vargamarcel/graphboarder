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
	let _scalarsAndEnumsDisplayTypes = $scalarsAndEnumsDisplayTypes;
	export let activeArgumentsData;
	let activeArgumentsDataGrouped = [];
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
	let reorder = '';
	let selectedForEdit = [];
	$: console.log('selectedForEdit', selectedForEdit);
	const moveUp = (group_argumentsData) => {
		console.log('group_argumentsData before', group_argumentsData);
		group_argumentsData.forEach((el, index, array) => {
			if (selectedForEdit.includes(el.stepsOfFieldsNewStringified) && index > 0) {
				let elToSubstitute = array[index - 1];
				if (!selectedForEdit.includes(elToSubstitute.stepsOfFieldsNewStringified)) {
					array[index] = elToSubstitute;
					array[index - 1] = el;
				}
			}
		});
		let new_activeArgumentsData = [];
		activeArgumentsDataGrouped.forEach((group) => {
			new_activeArgumentsData.push(...group.group_args);
		});
		overwrite_activeArgumentsData(new_activeArgumentsData);
		//activeArgumentsData = activeArgumentsData;
		//activeArgumentsDataGrouped = activeArgumentsDataGrouped;
		//group_argumentsData = group_argumentsData;
		console.log('group_argumentsData after', group_argumentsData);
	};
	const moveDown = () => {};
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
	$: if (activeArgumentsData) {
		console.log(
			'activeArgumentsData changed',
			activeArgumentsData,
			activeArgumentsData?.[0]?.chd_rawValue
		);

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
		activeArgumentsData.forEach((activeArgData) => {
			let activeArgGroup = activeArgumentsDataGrouped.find((el) => {
				return el.group_name == activeArgData.stepsOfFieldsNew[0];
			});

			if (activeArgGroup) {
				activeArgGroup.group_args.push(activeArgData);
			} else {
				rootGroup.group_args.push(activeArgData);
			}
		});

		console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);

		//
		if (activeArgumentsData.length > 0) {
			showActiveFilters = true;
		} else {
			showActiveFilters = false;
		}

		/////generate gqlArgObj to be used in query

		generate_final_gqlArgObj();

		if (activeArgumentsData.length == 0) {
			showModal = false;
		}
	}
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
				reorder = '';
				selectedForEdit = [];
			}
		}}
		on:apply={(e) => {
			console.log(']]]]]]]]]', e);
		}}
		><div class="  w-full  ">
			<div class="mx-auto mt-2  w-full   space-y-2   pb-2  ">
				<div class="w-2" />

				{#each activeArgumentsDataGrouped as group}
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
															if (
																!activeArgumentsData.some((el) => {
																	return (
																		el.stepsOfFieldsNewStringified ==
																		newArgData.stepsOfFieldsNewStringified
																	);
																})
															) {
																activeArgumentsData.push(e.detail);
																overwrite_activeArgumentsData(activeArgumentsData);
																console.log('activeArgumentsData', activeArgumentsData);
															} else {
																console.log('already added');
															}
														}}
													/>
												{/each}
											{:else}
												{#each argsInfo.filter((arg) => {
													return arg.dd_isRootArg;
												}) as arg, index}
													<Arg
														{index}
														type={arg}
														template="changeArguments"
														on:argAddRequest={(e) => {
															let newArgData = e.detail;
															if (
																!activeArgumentsData.some((el) => {
																	return (
																		el.stepsOfFieldsNewStringified ==
																		newArgData.stepsOfFieldsNewStringified
																	);
																})
															) {
																activeArgumentsData.push(e.detail);
																overwrite_activeArgumentsData(activeArgumentsData);
																console.log('activeArgumentsData', activeArgumentsData);
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
									<p class="text-xs font-light">
										({group.description})
									</p>
								{/if}{/if}
						</div>

						{#each group.group_args as activeArgumentData (activeArgumentData.stepsOfFieldsNewStringified + activeArgumentData.inUse)}
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
									activeArgumentData = activeArgumentData;
								}}
								{activeArgumentData}
								{reorder}
								{group}
								{generate_final_gqlArgObj}
								{delete_activeArgument}
								{activeArgumentsDataGrouped}
								{activeArgumentsData}
							/>
						{/each}
					</div>
					{#if group.dd_kindList && group.group_args?.length > 0}
						<div class="flex space-x-2 pr-2 mt-2">
							<button
								class="btn btn-xs {reorder == group.group_name
									? 'btn-accent w-1/2'
									: 'btn-primary w-full'}  transition-colors duration-1000"
								on:click={() => {
									if (reorder == group.group_name) {
										reorder = '';
									} else {
										reorder = group.group_name;
									}
								}}>{reorder == group.group_name ? 'done' : 'reorder'}</button
							>
							{#if reorder}
								<div class="w-1/2 flex space-x-2">
									<button
										class="btn btn-xs   w-1/2"
										on:click={() => {
											moveUp(group.group_args);
										}}><i class="bi bi-arrow-up-short" />up</button
									>
									<button class="btn btn-xs   w-1/2" on:click={() => {}}
										><i class="bi bi-arrow-down-short" />down</button
									>
								</div>
							{/if}
						</div>
					{/if}
				{/each}

				<div class="w-2" />
			</div>
		</div>
	</Modal>
{/if}

<div class="flex space-x-2 mb-2 px-2">
	<div class="dropdown ">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label tabindex="0" class="btn btn-sm bi bi-sliders text-lg p-1" />
		<div
			tabindex="0"
			class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-max text-sm shadow-2xl fixed left-0"
		>
			<slot />
		</div>
	</div>
	<button
		class="btn btn-xs  {activeArgumentsData.length > 0 ? 'btn-primary' : 'btn-secondary'}"
		on:click={() => {
			showModal = !showModal;
			//showActiveFilters = !showActiveFilters;
			showActiveFilters = true;
		}}
		>show active filters
	</button>
</div>
