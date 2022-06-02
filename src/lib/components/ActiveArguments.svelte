<script lang="ts">
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
	let _scalarsAndEnumsDisplayTypes = $scalarsAndEnumsDisplayTypes;
	export let activeArgumentsData;
	let activeArgumentsDataGrouped = {};
	let showActiveFilters;
	const dispatch = createEventDispatcher();
	let showModal = false;
	export let delete_activeArgument;

	const handleArgsChanged = () => {};

	const generate_gqlArgObj = () => {
		let gqlArgObj = {};
		let canRunQuery = true;
		activeArgumentsData.forEach((argData) => {
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

		let gqlArgObj_string = JSON.stringify(gqlArgObj)
			.replace(/"/g, '')
			.replace(/'/g, `"`)
			.slice(1, -1);
		console.log(
			'JSON.stringify(gqlArgObj)',
			JSON.stringify(gqlArgObj),
			JSON.stringify(gqlArgObj).replace(/"/g, '')
		);
		if (canRunQuery) {
			dispatch('argsChanged', { gqlArgObj, gqlArgObj_string });
		}
	};
	$: if (activeArgumentsData) {
		console.log(
			'activeArgumentsData changed',
			activeArgumentsData,
			activeArgumentsData?.[0]?.chd_rawValue
		);
		activeArgumentsDataGrouped = {};
		activeArgumentsData.forEach((el) => {
			if (el.stepsOfFieldsNew.length == 1) {
				if (activeArgumentsDataGrouped?.['root']) {
					activeArgumentsDataGrouped.root.push(el);
				} else {
					activeArgumentsDataGrouped.root = [el];
				}
			} else {
				let firstStep = el.stepsOfFieldsNew[0];
				if (activeArgumentsDataGrouped?.[firstStep]) {
					activeArgumentsDataGrouped[firstStep].push(el);
				} else {
					activeArgumentsDataGrouped[firstStep] = [el];
				}
			}
		});
		activeArgumentsDataGrouped.groups = Object.keys(activeArgumentsDataGrouped);
		console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
		if (activeArgumentsData.length > 0) {
			showActiveFilters = true;
		} else {
			showActiveFilters = false;
		}

		/////generate gqlArgObj to be used in query

		generate_gqlArgObj();

		if (activeArgumentsData.length == 0) {
			showModal = false;
		}
	}
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
			<div class="mx-auto mt-2  w-full  overflow-x-auto space-y-2   pb-2  ">
				<div class="w-2" />

				{#each activeArgumentsDataGrouped.groups as group}
					<div class="bg-base-100 p-2 rounded-box">
						<div class="font-bold">
							{group}
						</div>
						{#each activeArgumentsDataGrouped[group] as activeArgumentData}
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<div class=" bg-base-200 rounded-box p-2 my-2 flex">
								<div class=" pr-2">
									<input
										type="checkbox"
										class="checkbox input-primary"
										checked={activeArgumentData?.inUse}
										on:change={() => {
											activeArgumentData.inUse =
												activeArgumentData.inUse !== undefined ? !activeArgumentData.inUse : true;
											activeArgumentData = activeArgumentData;
										}}
									/>
								</div>
								<div class="grow ">
									<p class="  overflow-x-auto text-xs break-words mr-2  ">
										{activeArgumentData.stepsOfFieldsNew?.join(' > ')}
									</p>

									{#if activeArgumentData.dd_displayType == 'ENUM'}
										<div class="flex flex-col ">
											{#if activeArgumentData.dd_kindList}
												<FilterGroup
													extraData={activeArgumentData}
													choises={activeArgumentData?.chd_Choises
														? activeArgumentData.chd_Choises
														: activeArgumentData.enumValues.map((enumValue) => {
																return enumValue.name;
														  })}
													chosen={activeArgumentData?.chd_chosen}
													chosenInputField={activeArgumentData?.chosenInputField}
													isINPUT_OBJECT={activeArgumentData?.isINPUT_OBJECT}
													rawValue={activeArgumentData?.chd_rawValue}
													on:changed={(e) => {
														Object.assign(activeArgumentData, e.detail);
														console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
														console.log('activeArgumentsData', activeArgumentsData);
														//activeArgumentsData = activeArgumentsData
														generate_gqlArgObj();

														console.log(e.detail);
													}}
													id={activeArgumentData.stepsOfFieldsNew}
													title="choose"
													type="checkbox"
												/>
											{:else}
												<FilterGroup
													extraData={activeArgumentData}
													choises={activeArgumentData.enumValues.map((enumValue) => {
														return enumValue.name;
													})}
													chosen={activeArgumentData?.chd_chosen}
													chosenInputField={activeArgumentData?.chosenInputField}
													isINPUT_OBJECT={activeArgumentData?.isINPUT_OBJECT}
													rawValue={activeArgumentData?.chd_rawValue}
													dispatchValue={activeArgumentData?.chd_dispatchValue}
													on:changed={(e) => {
														Object.assign(activeArgumentData, e.detail);
														console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
														console.log('activeArgumentsData', activeArgumentsData);
														generate_gqlArgObj();
														console.log(e.detail);
													}}
													id={activeArgumentData.stepsOfFieldsNew}
													title="choose"
													type="radio"
												/>
											{/if}
										</div>
									{:else if activeArgumentData.dd_displayType == 'INPUT_OBJECT'}
										<FilterGroup
											extraData={activeArgumentData}
											choises={activeArgumentData.inputFields.map((inputField) => {
												return inputField.name;
											})}
											chosen={activeArgumentData?.chd_chosen}
											chosenInputField={activeArgumentData?.chosenInputField}
											isINPUT_OBJECT={activeArgumentData?.isINPUT_OBJECT}
											rawValue={activeArgumentData?.chd_rawValue}
											dispatchValue={activeArgumentData?.chd_dispatchValue}
											on:changed={(e) => {
												Object.assign(activeArgumentData, e.detail);
												console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
												console.log('activeArgumentsData', activeArgumentsData);
												//activeArgumentsData = activeArgumentsData
												generate_gqlArgObj();

												console.log(e.detail);
											}}
											id={activeArgumentData.stepsOfFieldsNew}
											title="choose"
											type="radio"
										/>
									{:else}
										<div>
											{#if activeArgumentData.dd_displayType == 'boolean'}
												<Toggle
													dd_displayType={activeArgumentData.dd_displayType}
													rawValue={activeArgumentData?.chd_rawValue}
													on:changed={(e) => {
														Object.assign(activeArgumentData, e.detail);
														console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
														console.log('activeArgumentsData', activeArgumentsData);
														//activeArgumentsData = activeArgumentsData
														generate_gqlArgObj();

														console.log(e.detail);
													}}
												/>
											{:else if activeArgumentData.dd_kindList}
												<Textarea
													dd_displayType={activeArgumentData.dd_displayType}
													rawValue={activeArgumentData?.chd_rawValue}
													dispatchValue={activeArgumentData?.chd_dispatchValue}
													on:changed={(e) => {
														Object.assign(activeArgumentData, e.detail);
														console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
														console.log('activeArgumentsData', activeArgumentsData);
														//activeArgumentsData = activeArgumentsData
														generate_gqlArgObj();

														console.log(e.detail);
													}}
												/>
											{:else}
												<Input
													dd_displayType={activeArgumentData.dd_displayType}
													rawValue={activeArgumentData?.chd_rawValue}
													on:changed={(e) => {
														Object.assign(activeArgumentData, e.detail);
														console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
														console.log('activeArgumentsData', activeArgumentsData);
														//activeArgumentsData = activeArgumentsData
														generate_gqlArgObj();

														console.log(e.detail);
													}}
												/>
											{/if}
										</div>
									{/if}
								</div>

								<button
									class="btn btn-sm"
									on:click={() => {
										delete_activeArgument(activeArgumentData.id);
									}}><i class="bi bi-trash3-fill" /></button
								>
							</div>
						{/each}
					</div>
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
		class="btn btn-xs  {activeArgumentsData.length > 0
			? 'btn-primary'
			: 'btn-secondary'} transition-colors duration-1000"
		on:click={() => {
			showModal = !showModal;
			//showActiveFilters = !showActiveFilters;
			showActiveFilters = true;
		}}
		>show active filters
	</button>
</div>
