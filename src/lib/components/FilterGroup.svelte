<script>
	import FilterItem from './FilterItem.svelte';
	import { createEventDispatcher } from 'svelte';

	export let containerEl;
	export let id;
	export let choises;
	export let title;
	export let modalTitle = title;
	export let type;
	export let chosenDefault;
	export let chosen;
	export let extraData;
	export let dd_displayStructure;
	let dispatch = createEventDispatcher();
	let detail;
	export let chosenInputField;
	let inputEl;
	export let rawValue = '';
	export let dispatchValue = null;
	export let isINPUT_OBJECT = false;

	const handleChanges = () => {
		//!!! create a 'validate' function
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
			} else {
				if (!['string', 'number', 'date'].includes(rawValue_TypeOf)) {
					rawValue = '';
					valueCouldBeValid = false;
				} else {
					dispatchValue = chosenInputField.dd_displayType == 'text' ? `'${rawValue}'` : rawValue;
				}
			}
			//console.log('-----', rawValue);

			if (valueCouldBeValid) {
				dispatch('changed', {
					chd_chosen: chosen,
					chd_dispatchValue: dispatchValue,
					chd_needsValue: true,
					chd_needsChosen: true,
					chd_rawValue: rawValue,
					chd_choises: choises,
					isINPUT_OBJECT,
					chosenInputField
				}); //chd_ == chosen data
			} else {
				dispatch('changed', {
					chd_chosen: chosen,
					chd_dispatchValue: dispatchValue,
					chd_needsValue: false,
					chd_needsChosen: true,
					chd_choises: choises,
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
				chd_choises: choises,
				isINPUT_OBJECT,
				chosenInputField
			}); //chd_ == chosen data
		}
	};
</script>

<div class="w-full">
	<FilterItem
		dd_displayStructure
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

			//console.log('chosenInputField', chosenInputField);
			//console.log('detail', detail);
			isINPUT_OBJECT = detail.extraData.dd_displayType == 'INPUT_OBJECT';
			choises = detail.choises;
			chosen = detail.chosen;
			handleChanges();
		}}
	/>
	<div />
</div>
