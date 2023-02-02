<script lang="ts">
	import { createEventDispatcher, each, getContext, setContext } from 'svelte/internal';
	import ActiveArgumentsGroupWraper from '$lib/components/ActiveArgumentsGroupWraper.svelte';
	const { activeArgumentsDataGrouped_Store, QMS_info } = getContext('QMSWraperContext');
	let activeArgumentsDataGrouped = [];

	$: console.log('$activeArgumentsDataGrouped_Store', $activeArgumentsDataGrouped_Store);
	const update_activeArgumentsDataGrouped = (groupNewData) => {
		activeArgumentsDataGrouped_Store.update_groups(groupNewData);
	};
	if ($activeArgumentsDataGrouped_Store.length == 0) {
		activeArgumentsDataGrouped_Store.set_groups(QMS_info?.args);
	}
	let showDescription = null;
</script>

{#if $activeArgumentsDataGrouped_Store.length == 0}
	<div class="p-2">
		<div class="alert alert-info shadow-lg">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="stroke-current flex-shrink-0 w-6 h-6"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span>No arguments available.</span>
			</div>
		</div>
	</div>
{/if}
{#each $activeArgumentsDataGrouped_Store as group}
	<ActiveArgumentsGroupWraper
		on:updateQuery={() => {}}
		{update_activeArgumentsDataGrouped}
		{group}
		argsInfo={QMS_info?.args}
		{showDescription}
		{activeArgumentsDataGrouped}
	/>
{/each}
