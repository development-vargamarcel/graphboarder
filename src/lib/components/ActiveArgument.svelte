<script>
	import { createEventDispatcher } from 'svelte';

	import Input from './fields/Input.svelte';
	import Textarea from './fields/Textarea.svelte';
	import Toggle from './fields/Toggle.svelte';
	import FilterGroup from './FilterGroup.svelte';
	let dispatch = createEventDispatcher();
	export let activeArgumentData;
	export let reorder;
	export let group;
	export let generate_final_gqlArgObj;
	export let delete_activeArgument;
	export let activeArgumentsDataGrouped;
	export let activeArgumentsData;
	let selectedForEdit = false;
	$: if (selectedForEdit !== undefined) {
		dispatch('selectedForEditChanged', {
			selectedForEditOn: selectedForEdit,
			selectedForEditValue: activeArgumentData.stepsOfFieldsNewStringified
		});
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<div
	class=" bg-base-200 rounded-box p-2 my-2 flex transition-all duration-500 {selectedForEdit &&
	reorder == group.group_name
		? 'border-[1px] border-accent'
		: 'border-[1px] border-transparent'}"
	on:click={() => {
		if (reorder == group.group_name) {
			selectedForEdit = !selectedForEdit;
		}
	}}
>
	<div class=" pr-2">
		<input
			type="checkbox"
			name="selectedForEdit"
			class="checkbox checkbox-accent transition-all duration-500 {reorder == group.group_name
				? 'visible'
				: 'invisible w-0'} "
			bind:checked={selectedForEdit}
			on:click={() => {}}
			disabled={reorder !== group.group_name}
			value={activeArgumentData.stepsOfFieldsNewStringified}
		/>
		<input
			type="checkbox"
			class="checkbox input-primary "
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
							generate_final_gqlArgObj();

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
							generate_final_gqlArgObj();
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
					generate_final_gqlArgObj();

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
							generate_final_gqlArgObj();

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
							generate_final_gqlArgObj();

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
							generate_final_gqlArgObj();

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
