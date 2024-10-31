<!-- @migration-task Error while migrating Svelte code: `<tHead>` is invalid inside `<table>` -->
<script>
	import EndpointinfoGeneratorAssistantItem from './EndpointinfoGeneratorAssistantItem.svelte';

	export let types = [];
</script>

<div class="overflow-auto overscroll-contain h-[80vh] w-[90vw]">
	<table class="table table-compact">
		<thead class=" sticky top-0">
			<tr>
				<th> </th>
				<th class="normal-case">displayName</th>
				<th class="normal-case">rootName</th>

				<th class="normal-case">L</th>
				<th class="normal-case">L</th>
				<th class="normal-case">E</th>
				<th class="normal-case">E</th>
			</tr>
		</thead>
		<tbody>
			{#each types as type, i}
				<EndpointinfoGeneratorAssistantItem {type} {i} />
			{/each}
		</tbody>
	</table>
</div>
