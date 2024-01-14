<script>
	import { createEventDispatcher } from 'svelte';
	import FilterGroup from '$lib/components/FilterGroup.svelte';
	export let typeInfo;
	export let rawValue;
	export let dispatchValue;
	const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col">
	<FilterGroup
		extraData={typeInfo}
		choises={typeInfo.enumValues.map((enumValue) => {
			return enumValue.name;
		})}
		chosen={dispatchValue}
		chosenInputField={typeInfo?.chosenInputField}
		chosenDefault={[]}
		isINPUT_OBJECT={typeInfo?.isINPUT_OBJECT}
		{rawValue}
		on:changed
		id={typeInfo.stepsOfFields}
		title="choose"
		type={typeInfo.dd_kindList ? 'checkbox' : 'radio'}
	/>
</div>
