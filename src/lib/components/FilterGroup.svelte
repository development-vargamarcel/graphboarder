<script>
	import FilterItem from './FilterItem.svelte';
	import FilterChoises from './FilterChoises.svelte';
	import { elementToDisplay, get_KindsArray, get_NamesArray } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher } from 'svelte';
	import { loop_guard } from 'svelte/internal';
	import Input from './fields/Input.svelte';
	import Textarea from './fields/Textarea.svelte';
	import Toggle from './fields/Toggle.svelte';
	import Map from './fields/Map.svelte';

	export let id;
	export let choises;
	export let title;
	export let modalTitle = title;
	export let type;
	export let chosenDefault;
	export let chosen;
	export let extraData;
	let dispatch = createEventDispatcher();
	let detail;
	export let chosenInputField;
	let inputEl;
	export let rawValue = '';
	export let dispatchValue = null;
	export let isINPUT_OBJECT = false;

	const handleChanges = () => {
		let valueCouldBeValid = true;
		if (chosenInputField) {
			let rawValue_TypeOf = typeof rawValue;
			if (chosenInputField.dd_kindList) {
				if (!['string', 'number', 'date'].includes(rawValue_TypeOf)) {
					rawValue = '';
					valueCouldBeValid = false;
				} else {
					dispatchValue = rawValue.split('\n');
					dispatchValue = dispatchValue.map((elVal) => {
						return chosenInputField.dd_displayType == 'text' ? `'${elVal}'` : elVal || '';
					});
				}
			} else if (chosenInputField.dd_displayType == 'boolean') {
				if (typeof rawValue !== 'boolean') {
					rawValue = true;
					dispatchValue = true;
				} else {
					dispatchValue = rawValue;
				}
			} else if (chosenInputField.dd_displayType == 'geo') {
				//
			} else {
				if (!['string', 'number', 'date'].includes(rawValue_TypeOf)) {
					rawValue = '';
					valueCouldBeValid = false;
				} else {
					dispatchValue = chosenInputField.dd_displayType == 'text' ? `'${rawValue}'` : rawValue;
				}
			}
			console.log('-----', rawValue);

			if (valueCouldBeValid) {
				dispatch('changed', {
					chd_chosen: chosen,
					chd_dispatchValue: dispatchValue,
					chd_needsValue: true,
					chd_needsChosen: true,
					chd_rawValue: rawValue,
					chd_Choises: choises,
					isINPUT_OBJECT,
					chosenInputField
				}); //chd_ == chosen data
			} else {
				dispatch('changed', {
					chd_chosen: chosen,
					chd_dispatchValue: dispatchValue,
					chd_needsValue: false,
					chd_needsChosen: true,
					chd_Choises: choises,
					isINPUT_OBJECT,
					chosenInputField
				}); //chd_ == chosen data
			}
		} else if (chosen) {
			dispatch('changed', {
				chd_chosen: chosen,
				chd_dispatchValue: dispatchValue,
				chd_needsValue: false,
				chd_needsChosen: true,
				chd_Choises: choises,
				isINPUT_OBJECT,
				chosenInputField
			}); //chd_ == chosen data
		}
	};
</script>

<div class="w-full">
	<FilterItem
		{extraData}
		{id}
		{choises}
		{title}
		{modalTitle}
		{type}
		{chosenDefault}
		{chosen}
		on:filterApplied={(e) => {
			let { detail } = e;
			chosenInputField = detail.extraData.inputFields?.filter((el) => {
				return el.dd_displayName == detail.chosen;
			})[0];

			console.log('chosenInputField', chosenInputField);
			console.log('detail', detail);
			isINPUT_OBJECT = detail.extraData.dd_displayType == 'INPUT_OBJECT';
			choises = detail.choises;
			chosen = detail.chosen;
			handleChanges();
		}}
	/>

	{#if isINPUT_OBJECT}
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">
			{#if chosenInputField.dd_kindList}
				<Textarea
					dd_displayType={chosenInputField.dd_displayType}
					{rawValue}
					{dispatchValue}
					on:changed={(e) => {
						rawValue = e.detail.chd_rawValue;
						handleChanges();
					}}
				/>
			{:else if chosenInputField.dd_displayType == 'boolean'}
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label  w-full ">
					<Toggle
						dd_displayType={chosenInputField.dd_displayType}
						{rawValue}
						on:changed={(e) => {
							rawValue = e.detail.chd_rawValue;
							handleChanges();
						}}
					/>
				</label>
			{:else if chosenInputField.dd_displayType == 'geo'}
				<Map />
				<!-- <input
					type={chosenInputField.dd_displayType}
					class="input input-primary input-xs w-20 h-20 mr-2 "
					placeholder="map here"
					bind:this={inputEl}
					value={rawValue}
					on:change={() => {
						rawValue = inputEl.value;
						handleChanges();
					}}
				/> -->
			{:else}
				<Input
					dd_displayType={chosenInputField.dd_displayType}
					{rawValue}
					on:changed={(e) => {
						rawValue = e.detail.chd_rawValue;
						handleChanges();
					}}
				/>
			{/if}
		</label>
	{/if}
</div>
