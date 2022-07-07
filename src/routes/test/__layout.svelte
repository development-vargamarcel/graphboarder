<script>
	import Map from '$lib/components/fields/Map.svelte';

	let containerEl;
</script>

<div class="testMap p-10" bind:this={containerEl}>
	<Map {containerEl} />
</div>
