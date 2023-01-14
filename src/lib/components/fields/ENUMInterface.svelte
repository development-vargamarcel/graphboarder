<script>
	import { createEventDispatcher } from 'svelte';
	import FilterGroup from '../FilterGroup.svelte';
	export let typeInfo;
	const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col">
	<FilterGroup
		extraData={typeInfo}
		choises={typeInfo?.chd_choises
			? typeInfo.chd_choises
			: typeInfo.enumValues.map((enumValue) => {
					return enumValue.name;
			  })}
		chosen={typeInfo?.chd_chosen}
		chosenInputField={typeInfo?.chosenInputField}
		isINPUT_OBJECT={typeInfo?.isINPUT_OBJECT}
		rawValue={typeInfo?.chd_rawValue}
		on:changed={(e) => {
			dispatch('changed', e.detail);
		}}
		id={typeInfo.stepsOfFields}
		title="choose"
		type={typeInfo.dd_kindList ? 'checkbox' : 'radio'}
	/>
</div>
