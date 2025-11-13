<script lang="ts">
	import { run } from 'svelte/legacy';

	import FilterItem from '$lib/components/FilterItem.svelte';
	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();
	let detail;
	let inputEl;
	interface Props {
		containerEl: any;
		id: any;
		choises: any;
		title: any;
		modalTitle?: any;
		type: any;
		chosenDefault: any;
		chosen: any;
		extraData: any;
		chosenInputField: any;
		rawValue?: string;
		isINPUT_OBJECT?: boolean;
	}

	let {
		containerEl,
		id,
		choises = $bindable(),
		title,
		modalTitle = title,
		type,
		chosenDefault,
		chosen = $bindable(),
		extraData,
		chosenInputField = $bindable(),
		rawValue = '',
		isINPUT_OBJECT = $bindable(false)
	}: Props = $props();
	// if (typeof chosen == 'string') {
	// 	chosen = [chosen];
	// }
	run(() => {
		console.log('changed', { chosen });
	});
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

			isINPUT_OBJECT = detail.extraData.dd_displayInterface == 'INPUT_OBJECT';
			choises = detail.choises;
			chosen = detail.chosen;
			//console.log('changed', { detail });
			const dispatchObject = {
				// chd_dispatchValue: chosen,
				chd_rawValue: chosen,
				isINPUT_OBJECT,
				chosenInputField
			};
			dispatch('changed', dispatchObject);
		}}
	/>
	<div></div>
</div>
