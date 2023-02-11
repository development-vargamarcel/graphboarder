<script>
	import ActiveArgumentsGroup_addFilterAndSortingButtonContent from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButtonContent.svelte';

	export let group;
	export let argsInfo;
	export let update_activeArgumentsDataGrouped;
	export let activeArgumentsDataGrouped;
	export let node;
	export let prefix = '';
	export let parent_inputFields;
	export let parent_stepsOfFields;
</script>

<div class=" ">
	<div class="dropdown dropdown-start ">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<label
			tabindex="0"
			class="btn btn-xs btn-ghost  bi bi-plus-circle p-1  mr-2 overscroll-contain"
		/>
		<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
		<div
			tabindex="0"
			class="dropdown-content menu p-2  bg-base-100 rounded-box w-max text-sm shadow-2xl overflow-y-auto overscroll-contain  max-h-52 sm:max-h-72 md:max-h-90    max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
		>
			<ActiveArgumentsGroup_addFilterAndSortingButtonContent
				{group}
				{argsInfo}
				{update_activeArgumentsDataGrouped}
				{activeArgumentsDataGrouped}
				{node}
				{prefix}
				{parent_inputFields}
				{parent_stepsOfFields}
			/>
		</div>
	</div>
</div>
