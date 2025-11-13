<script lang="ts">
	import FilterGroup from '$lib/components/FilterGroup.svelte';
	let { typeInfo, rawValue, dispatchValue, onChanged } = $props();
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
		{onChanged}
		id={typeInfo.stepsOfFields}
		title="choose"
		type={typeInfo.dd_kindList ? 'checkbox' : 'radio'}
	/>
</div>
