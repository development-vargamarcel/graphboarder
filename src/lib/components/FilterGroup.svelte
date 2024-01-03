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
	// if (typeof chosen == 'string') {
	// 	chosen = [chosen];
	// }

	export let extraData;
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
		{extraData}
		{id}
		{choises}
		{title}
		{modalTitle}
		{type}
		{chosenDefault}
		chosen={dispatchValue}
		on:filterApplied={(e) => {
			let { detail } = e;
			chosenInputField = detail.extraData.inputFields?.filter((el) => {
				return el.dd_displayName == detail.chosen;
			})[0];

			isINPUT_OBJECT = detail.extraData.dd_displayInterface == 'INPUT_OBJECT';
			choises = detail.choises;
			chosen = detail.chosen;
			console.log('changed', { detail });
			const dispatchObject = {
				chd_dispatchValue: chosen,
				isINPUT_OBJECT,
				chosenInputField
			};
			dispatch('changed', dispatchObject);
		}}
	/>
	<div />
</div>
