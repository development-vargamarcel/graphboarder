<script lang="ts">
	import FilterItem from '$lib/components/FilterItem.svelte';
	import { Logger } from '$lib/utils/logger';

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
		onChanged?: (detail: any) => void;
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
		isINPUT_OBJECT = $bindable(false),
		onChanged
	}: Props = $props();
	// if (typeof chosen == 'string') {
	// 	chosen = [chosen];
	// }
	$effect(() => {
		Logger.debug('changed', { chosen });
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
		onFilterApplied={(detail) => {
			chosenInputField = detail.extraData.inputFields?.filter((el) => {
				return el.dd_displayName == detail.chosen;
			})[0];

			isINPUT_OBJECT = detail.extraData.dd_displayInterface == 'INPUT_OBJECT';
			choises = detail.choises;
			chosen = detail.chosen;
			//Logger.debug('changed', { detail });
			const dispatchObject = {
				// chd_dispatchValue: chosen,
				chd_rawValue: chosen,
				isINPUT_OBJECT,
				chosenInputField
			};
			onChanged?.(dispatchObject);
		}}
	/>
	<div></div>
</div>
