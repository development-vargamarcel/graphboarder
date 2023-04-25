<script>
	import EndpointinfoGeneratorAssistantItem from './EndpointinfoGeneratorAssistantItem.svelte';

	export let types = [];
</script>

<div class="overflow-x-auto w-[90vw]">
	<table class="table table-compact">
		<tHead class="">
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
