<!-- @migration-task Error while migrating Svelte code: `<tHead>` cannot be a child of `<table>`. `<table>` only allows these children: `<caption>`, `<colgroup>`, `<tbody>`, `<thead>`, `<tfoot>`, `<style>`, `<script>`, `<template>`. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.
https://svelte.dev/e/node_invalid_placement -->
<script>
	import EndpointinfoGeneratorAssistantItem from './EndpointinfoGeneratorAssistantItem.svelte';

	export let types = [];
</script>

<div class="overflow-auto overscroll-contain h-[80vh] w-[90vw]">
	<table class="table table-compact">
		<tHead class=" sticky top-0">
			<th />
			<th class="normal-case">displayName</th>
			<th class="normal-case">rootName</th>

			<th class="normal-case">L</th>
			<th class="normal-case">L</th>
			<th class="normal-case">E</th>
			<th class="normal-case">E</th>
		</tHead>
		<tBody>
			{#each types as type, i}
				<EndpointinfoGeneratorAssistantItem {type} {i} />
			{/each}
		</tBody>
	</table>
</div>
