<script>
	import { getRootType_NamesArray } from './../utils/usefulFunctions.ts';
	import { getRootType_KindsArray } from '$lib/utils/usefulFunctions';
	import { scalarsAndEnumsDisplayTypes } from '$lib/stores/scalarsAndEnumsDisplayTypes';
	import FilterChoises from '$lib/components/FilterChoises.svelte';
	import FilterGroup from './FilterGroup.svelte';
	import FilterItem from './FilterItem.svelte';
	let _scalarsAndEnumsDisplayTypes = $scalarsAndEnumsDisplayTypes;
	export let activeArgumentsData;
</script>

<div class="mx-auto mt-2 grid w-full auto-cols-max grid-flow-col gap-x-2 overflow-x-auto  pb-2">
	<div class="w-2" />
	{#each activeArgumentsData as activeArgumentData (activeArgumentData.stepsOfFieldsNewStringified)}
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<div class=" bg-base-200 rounded-box p-2">
			<p class="  overflow-x-auto text-xs break-words">
				{activeArgumentData.stepsOfFieldsNew.join(' > ')}
			</p>

			{#if activeArgumentData.displayType == 'ENUM'}
				<div class="flex flex-col">
					{#if activeArgumentData.expectsList}
						<FilterGroup
							choises={activeArgumentData.enumValues.map((enumValue) => {
								return enumValue.name;
							})}
							id={activeArgumentData.stepsOfFieldsNew}
							title={activeArgumentData.stepsOfFieldsNew.join(' > ')}
							type="checkbox"
						/>
					{:else}
						<FilterGroup
							choises={activeArgumentData.enumValues.map((enumValue) => {
								return enumValue.name;
							})}
							id={activeArgumentData.stepsOfFieldsNew}
							title={activeArgumentData.stepsOfFieldsNew.join(' > ')}
							type="radio"
						/>
					{/if}
				</div>
			{:else if activeArgumentData.displayType == 'INPUT_OBJECT'}
				<FilterGroup
					choises={activeArgumentData.inputFields.map((inputField) => {
						return inputField.name;
					})}
					id={activeArgumentData.stepsOfFieldsNew}
					title={activeArgumentData.stepsOfFieldsNew.join(' > ')}
					type="radio"
				/>
				<!-- <div class="flex flex-col">
					<div class="dropdown">
						<label tabindex="0" class="btn btn-xs m-1">choose and fill</label>
						<div
							tabindex="0"
							class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full max-h-52 sm:max-h-72 md:max-h-90 overflow-auto overscroll-contain "
						>
							{#each activeArgumentData.inputFields as inputField}
								<label class="label">
									<p class="w-20">
										{inputField.name}
									</p>
									<input
										type="radio"
										class="radio mr-2 input-primary"
										name={activeArgumentData.stepsOfFieldsNewStringified}
									/>
									{#if getRootType_KindsArray(inputField).includes('LIST')}
										<textarea class="textarea textarea-primary textarea-xs w-40 mr-2" />
									{:else if _scalarsAndEnumsDisplayTypes[getRootType_NamesArray(inputField)[getRootType_NamesArray(inputField).length - 1]] == 'boolean'}
										<label class="label  w-40">
											<div class="flex">
												<input type="checkbox" class="checkbox input-primary" />
												<p class="pl-2">true</p>
											</div>
										</label>
									{:else if _scalarsAndEnumsDisplayTypes[getRootType_NamesArray(inputField)[getRootType_NamesArray(inputField).length - 1]] == 'geo'}
										<input
											type={activeArgumentData.displayType}
											class="input input-primary input-xs w-20 h-20 mr-2 "
											placeholder="map here"
										/>
									{:else}
										<input
											type={activeArgumentData.displayType}
											class="input input-primary input-xs w-40 mr-2"
										/>{/if}
								</label>
							{/each}
						</div>
					</div>
				</div> -->
			{:else}
				<div>
					{#if activeArgumentData.expectsList}
						<textarea class="textarea textarea-primary textarea-xs" />
					{:else}
						<input type={activeArgumentData.displayType} class="input input-primary input-xs" />
					{/if}
				</div>
			{/if}
		</div>
	{/each}
	<div class="w-2" />
</div>
