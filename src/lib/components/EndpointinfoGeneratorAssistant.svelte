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
