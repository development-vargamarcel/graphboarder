<script>
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { createEventDispatcher } from 'svelte';

	import Input from './fields/Input.svelte';
	import Textarea from './fields/Textarea.svelte';
	import Toggle from './fields/Toggle.svelte';
	import FilterGroup from './FilterGroup.svelte';
	import { fade } from 'svelte/transition';
	import { cubicIn } from 'svelte/easing';
	import Map from './fields/Map.svelte';
	import { generate_gqlArgObj, generate_group_gqlArgObj } from '$lib/utils/usefulFunctions';
	import { clickOutside } from '$lib/actions/clickOutside';
	let dispatch = createEventDispatcher();
	export let activeArgumentData;
	export let group;
	export let delete_activeArgument;
	export let activeArgumentsDataGrouped;
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
			//if (shadowEl.style.height == 0) ensures the bellow runs only once per grab of element to move
			shadowEl.style.height = `${shadowHeight + 18}px`;
			shadowEl.style.width = `${shadowWidth}px`;

			//put labelElClone in place of shadowEl
			// if (labelElClone) {
			// 	shadowEl.removeChild(labelElClone);
			// }
			labelElClone = labelEl.cloneNode(true);
			labelElClone.classList.remove('dnd-item');
			labelElClone.classList.add('border-2', 'border-accent');

			shadowEl.appendChild(labelElClone);
		}
	}
	let expandedVersion = false;
	let valueToDisplay = () => {
		let value;
		if (activeArgumentData.dd_displayType == 'ENUM') {
			value = activeArgumentData.chd_chosen;
		} else {
			value = activeArgumentData.chd_dispatchValue;
		}

		if (value && activeArgumentData.dd_displayType == 'geo') {
			value = '[map]';
		}

		return value;
	};
	let canRunQuery = activeArgumentData?.canRunQuery;
	const handleChanged = (detail) => {
		Object.assign(activeArgumentData, detail);
		Object.assign(activeArgumentData, generate_gqlArgObj([activeArgumentData]));
		Object.assign(group, generate_group_gqlArgObj(group));
		console.log({ activeArgumentsDataGrouped });
		console.log('generate_gqlArgObj', generate_gqlArgObj([activeArgumentData]));
		console.log({ activeArgumentData });

		dispatch('changed', detail);
		if (activeArgumentData?.inUse) {
			dispatch('updateQuery');
		}
		console.log(detail);
		canRunQuery = activeArgumentData?.canRunQuery;
		if (!activeArgumentData.inUse && valueToDisplay() !== undefined) {
			inUse_toggle();
		}
		if (activeArgumentData.inUse && valueToDisplay() == undefined) {
			inUse_toggle();
		}
	};
	const handleClickOutside = () => {
		console.log('clicked outside');
		expandedVersion = false;
	};
	const inUse_toggle = () => {
		if (!activeArgumentData?.inUse && (valueToDisplay() == undefined || !canRunQuery)) {
			expandedVersion = true;
		} else {
			dispatch('inUseChanged');
			activeArgumentData.inUse =
				activeArgumentData.inUse !== undefined ? !activeArgumentData.inUse : true;

			activeArgumentData = activeArgumentData;
			Object.assign(activeArgumentData, generate_gqlArgObj([activeArgumentData]));
			Object.assign(group, generate_group_gqlArgObj(group));
			dispatch('updateQuery');
		}
	};
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label
	use:clickOutside
	on:click_outside={handleClickOutside}
	class="   rounded-box {expandedVersion
		? 'p-2'
		: ''}  my-1 flex   dnd-item {activeArgumentData?.inUse
		? canRunQuery
			? 'ring ring-[1px]  bg-base-300 ring-primary/50'
			: 'ring ring-[1px]  ring-primary/50 bg-error/50'
		: 'bg-base-200'} "
	bind:this={labelEl}
	on:contextmenu|preventDefault|stopPropagation={() => {
		dispatch('contextmenuUsed');
	}}
>
	<div class="grow ">
		<div class="  flex  space-x-2 ">
			<input
				type="checkbox"
				class="checkbox input-primary hidden"
				checked={activeArgumentData?.inUse}
				on:change={inUse_toggle}
			/>
			<div class="   text-xs  select-none flex grow flex-nowrap pt-1">
				<div class="flex flex-nowrap  overflow-x-auto  max-w-[65vw] ">
					<p class="  pr-1 font-semibold shrink-0  text-base-content">
						{activeArgumentData.stepsOfFieldsNew?.join(' > ') + ':'}
					</p>

					{#if !expandedVersion}
						<p class="shrink-0 text-base-content font-light">{valueToDisplay()}</p>
					{/if}
				</div>
			</div>
			{#if expandedVersion}
				{#if activeArgumentData.description}
					<button
						class="btn btn-xs bi bi-info-circle mx-2"
						title={activeArgumentData.description}
						on:click={() => {
							showDescription = !showDescription;
						}}
					/>
				{/if}
				<button
					class="btn btn-xs"
					on:click={() => {
						dispatch('delete_activeArgument');
						// delete_activeArgument(activeArgumentData.id);
					}}><i class="bi bi-trash3-fill" /></button
				>
			{/if}

			<button
				class="btn btn-xs {expandedVersion ? 'btn-primary ' : '  '}"
				on:click={() => {
					expandedVersion = !expandedVersion;
				}}><i class="bi bi-chevron-expand" /></button
			>
		</div>
		{#if showDescription}
			<p class="text-secondary text-xs select-none">
				({activeArgumentData.description})
			</p>
		{/if}
		{#if expandedVersion}
			<div class="px-2 mt-2">
				{#if activeArgumentData.dd_displayType == 'ENUM'}
					<div class="flex flex-col">
						{#if activeArgumentData.dd_kindList}
							<FilterGroup
								containerEl={labelEl}
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
									handleChanged(e.detail);
								}}
								id={activeArgumentData.stepsOfFieldsNew}
								title="choose"
								type="checkbox"
							/>
						{:else}
							<FilterGroup
								containerEl={labelEl}
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
									handleChanged(e.detail);
								}}
								id={activeArgumentData.stepsOfFieldsNew}
								title="choose"
								type="radio"
							/>
						{/if}
					</div>
				{:else if activeArgumentData.dd_displayType == 'INPUT_OBJECT'}
					<FilterGroup
						containerEl={labelEl}
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
							Object.assign(activeArgumentData, generate_gqlArgObj([activeArgumentData]));
							Object.assign(group, generate_group_gqlArgObj(group));
							console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
							console.log(
								'generate_gqlArgObj([activeArgumentData])',
								generate_gqlArgObj([activeArgumentData])
							);
							if (activeArgumentData?.inUse) {
								dispatch('updateQuery');
							}

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
									handleChanged(e.detail);
								}}
							/>
						{:else if activeArgumentData.dd_displayType == 'geo'}
							<Map
								rawValue={activeArgumentData?.chd_rawValue}
								on:changed={(e) => {
									handleChanged(e.detail);
								}}
							/>
						{:else if activeArgumentData.dd_kindList}
							<Textarea
								dd_displayType={activeArgumentData.dd_displayType}
								rawValue={activeArgumentData?.chd_rawValue}
								dispatchValue={activeArgumentData?.chd_dispatchValue}
								on:changed={(e) => {
									handleChanged(e.detail);
								}}
							/>
						{:else}
							<Input
								dd_displayType={activeArgumentData.dd_displayType}
								rawValue={activeArgumentData?.chd_rawValue}
								on:changed={(e) => {
									handleChanged(e.detail);
								}}
							/>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- <button
		class="btn btn-sm"
		on:click={() => {
			dispatch('delete_activeArgument');
			// delete_activeArgument(activeArgumentData.id);
		}}><i class="bi bi-trash3-fill" /></button
	> -->
</label>

{#if activeArgumentData[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
	<div
		class=" ml-8 h-0    absolute w-11/12   top-0 left-0 visible"
		id="shadowEl"
		bind:this={shadowEl}
	/>
{/if}
