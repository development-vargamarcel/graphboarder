<script lang="ts">
	import EndpointinfoGeneratorAssistantItem from './EndpointinfoGeneratorAssistantItem.svelte';

	interface Props {
		types?: any[];
	}

	let { types = [] }: Props = $props();
</script>

<div class="overflow-auto overscroll-contain h-[80vh] w-[90vw]">
	<table class="table table-compact">
		<thead class=" sticky top-0">
			<tr>
				<th />
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
