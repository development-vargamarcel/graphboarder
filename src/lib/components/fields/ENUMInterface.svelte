<script>
	import { createEventDispatcher } from 'svelte';
	import FilterGroup from '$lib/components/FilterGroup.svelte';
	export let typeInfo;
	const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col">
	<FilterGroup
		extraData={typeInfo}
		choises={typeInfo.enumValues.map((enumValue) => {
			return enumValue.name;
		})}
		chosen={typeInfo?.chd_dispatchValue}
		chosenInputField={typeInfo?.chosenInputField}
		chosenDefault={[]}
		isINPUT_OBJECT={typeInfo?.isINPUT_OBJECT}
		rawValue={typeInfo?.chd_rawValue}
		on:changed
		id={typeInfo.stepsOfFields}
		title="choose"
		type={typeInfo.dd_kindList ? 'checkbox' : 'radio'}
	/>
</div>
