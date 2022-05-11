<script>
	import { getRootType_NamesArray } from './../utils/usefulFunctions.ts';
	import { getRootType_KindsArray } from '$lib/utils/usefulFunctions';
	import { scalarsAndEnumsDisplayTypes } from '$lib/stores/scalarsAndEnumsDisplayTypes';
	import FilterChoises from '$lib/components/FilterChoises.svelte';
	import FilterGroup from './FilterGroup.svelte';
	import FilterItem from './FilterItem.svelte';
	let _scalarsAndEnumsDisplayTypes = $scalarsAndEnumsDisplayTypes;
	export let activeArgumentsData;

	let activeArgumentsDataGrouped = {};
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
	let showActiveFilters = false;
</script>

{#if !showActiveFilters}
	<button
		class="btn btn-xs  {activeArgumentsData.length > 0 ? 'btn-primary' : 'btn-secondary'}"
		on:click={() => {
			showActiveFilters = true;
		}}>show filters</button
	>
{/if}

{#if showActiveFilters}
	<button
		class="btn btn-xs btn-primary mx-auto "
		on:click={() => {
			showActiveFilters = false;
		}}>hide</button
	>

	<div class="  w-full h-80 bg-base-200/50 overflow-y-auto overscroll-contain">
		<div class="mx-auto mt-2  w-full px-4 overflow-x-auto space-y-2   pb-2  ">
			<div class="w-2" />

			{#each activeArgumentsDataGrouped.groups as group}
				<div class="bg-base-100 p-2 rounded-box">
					<div class="font-bold">
						{group}
					</div>
					{#each activeArgumentsDataGrouped[group] as activeArgumentData}
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<div class=" bg-base-200 rounded-box p-2 my-2  ">
							<p class="  overflow-x-auto text-xs break-words mr-2  ">
								{activeArgumentData.stepsOfFieldsNew.join(' > ')}
							</p>

							{#if activeArgumentData.displayType == 'ENUM'}
								<div class="flex flex-col ">
									{#if activeArgumentData.expectsList}
										<FilterGroup
											extraData={activeArgumentData}
											choises={activeArgumentData.enumValues.map((enumValue) => {
												return enumValue.name;
											})}
											id={activeArgumentData.stepsOfFieldsNew}
											title="choose"
											}
											type="checkbox"
										/>
									{:else}
										<FilterGroup
											extraData={activeArgumentData}
											choises={activeArgumentData.enumValues.map((enumValue) => {
												return enumValue.name;
											})}
											id={activeArgumentData.stepsOfFieldsNew}
											title="choose"
											}
											type="radio"
										/>
									{/if}
								</div>
							{:else if activeArgumentData.displayType == 'INPUT_OBJECT'}
								<FilterGroup
									extraData={activeArgumentData}
									choises={activeArgumentData.inputFields.map((inputField) => {
										return inputField.name;
									})}
									id={activeArgumentData.stepsOfFieldsNew}
									title="choose"
									}
									type="radio"
								/>
							{:else}
								<div>
									{#if activeArgumentData.expectsList}
										<textarea class="textarea textarea-primary textarea-xs" />
									{:else}
										<input
											type={activeArgumentData.displayType}
											class="input input-primary input-xs"
										/>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/each}

			<div class="w-2" />
		</div>
	</div>
	<button
		class="btn btn-xs btn-primary mx-auto "
		on:click={() => {
			showActiveFilters = false;
		}}>hide</button
	>
{/if}
