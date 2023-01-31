<script lang="ts">
	import { createEventDispatcher, each, getContext, setContext } from 'svelte/internal';
	import ActiveArgumentsGroupWraper from '$lib/components/ActiveArgumentsGroupWraper.svelte';
	const { activeArgumentsDataGrouped_Store, QMS_info } = getContext('QMSWraperContext');
	let activeArgumentsDataGrouped = [];
	$: console.log({ activeArgumentsDataGrouped });
	const update_activeArgumentsDataGrouped = (groupNewData) => {
		activeArgumentsDataGrouped_Store.update_groups(groupNewData);
	};

	activeArgumentsDataGrouped_Store.set_groups(QMS_info?.args);
	let showDescription = null;
</script>

{#if $activeArgumentsDataGrouped_Store.length == 0}
	<div>No arguments</div>
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
