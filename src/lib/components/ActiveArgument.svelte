<script>
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { createEventDispatcher } from 'svelte';

	import Input from './fields/Input.svelte';
	import Textarea from './fields/Textarea.svelte';
	import Toggle from './fields/Toggle.svelte';
	import FilterGroup from './FilterGroup.svelte';
	import { fade } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	let dispatch = createEventDispatcher();
	export let activeArgumentData;
	export let group;
	export let generate_final_gqlArgObj;
	export let delete_activeArgument;
	export let activeArgumentsDataGrouped;
	export let activeArgumentsData;

	let showDescription = false;
	let labelEl;
	let shadowEl;
	let shadowHeight = 20;
	let shadowWidth = 20;

	let labelElClone;

	$: if (labelEl) {
		shadowHeight = labelEl.clientHeight;
		shadowWidth = labelEl.clientWidth;
	}

	$: console.log(shadowEl);
	$: if (shadowHeight && shadowEl) {
		if (shadowEl.style.height == 0) {
			shadowEl.style.height = `${shadowHeight + 18}px`;
			shadowEl.style.width = `${shadowWidth}px`;

			//put labelElClone in place of shadowEl
			if (labelElClone) {
				shadowEl.removeChild(labelElClone);
			}
			labelElClone = labelEl.cloneNode(true);
			labelElClone.classList.remove('dnd-item');
			shadowEl.appendChild(labelElClone);
		}
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class=" bg-base-200 rounded-box p-2 my-2 flex   dnd-item" bind:this={labelEl}>
	<div class=" pr-2">
		<input
			type="checkbox"
			class="checkbox input-primary "
			checked={activeArgumentData?.inUse}
			on:change={() => {
				dispatch('inUseChanged');
				activeArgumentData.inUse =
					activeArgumentData.inUse !== undefined ? !activeArgumentData.inUse : true;
				activeArgumentData = activeArgumentData;
				generate_final_gqlArgObj();
			}}
		/>
	</div>
	<div class="grow ">
		<p class="  overflow-x-auto text-xs break-words mr-2 flex ">
			{activeArgumentData.stepsOfFieldsNew?.join(' > ')}
			{#if activeArgumentData.description}
				<i
					class="bi bi-info-circle text-secondary mx-2"
					title={activeArgumentData.description}
					on:click={() => {
						showDescription = !showDescription;
					}}
				/>
				{#if showDescription}
					<p class="text-secondary text-xs select-none">
						({activeArgumentData.description})
					</p>
				{/if}
			{/if}
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
			dispatch('delete_activeArgument');
			// delete_activeArgument(activeArgumentData.id);
		}}><i class="bi bi-trash3-fill" /></button
	>
</label>

{#if activeArgumentData[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
	<div
		in:fade={{ duration: 200, easing: cubicIn }}
		class="rounded-box ml-8 h-0  border-dotted  border-accent/20 border-2 text-primary absolute w-11/12   top-0 left-0 visible"
		id="shadowEl"
		bind:this={shadowEl}
	/>
{/if}
