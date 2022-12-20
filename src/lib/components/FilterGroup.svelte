<script>
	import FilterItem from '$lib/components/FilterItem.svelte';
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

			isINPUT_OBJECT = detail.extraData.dd_displayType == 'INPUT_OBJECT';
			choises = detail.choises;
			chosen = detail.chosen;
			dispatch('changed', {
				chd_chosen: chosen,
				chd_dispatchValue: dispatchValue,
				chd_needsValue: false,
				chd_needsChosen: true,
				chd_choises: choises,
				isINPUT_OBJECT,
				chosenInputField
			});
		}}
	/>
	<div />
</div>
