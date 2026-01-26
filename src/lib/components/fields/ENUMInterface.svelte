<script lang="ts">
	import FilterGroup from '$lib/components/FilterGroup.svelte';
	let { typeInfo, rawValue, dispatchValue, onChanged } = $props();
    let containerEl: HTMLElement | undefined = $state();
</script>

<div class="flex flex-col" bind:this={containerEl}>
	<FilterGroup
		extraData={typeInfo}
		choises={typeInfo.enumValues.map((enumValue: any) => {
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
        containerEl={containerEl}
	/>
</div>
