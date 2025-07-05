<script>
	import { run } from 'svelte/legacy';

	import FilterItem from '$lib/components/FilterItem.svelte';
	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();
	let detail;
	let inputEl;
	/**
	 * @typedef {Object} Props
	 * @property {any} containerEl
	 * @property {any} id
	 * @property {any} choises
	 * @property {any} title
	 * @property {any} [modalTitle]
	 * @property {any} type
	 * @property {any} chosenDefault
	 * @property {any} chosen
	 * @property {any} extraData
	 * @property {any} chosenInputField
	 * @property {string} [rawValue]
	 * @property {boolean} [isINPUT_OBJECT]
	 */

	/** @type {Props} */
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
	} = $props();
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
