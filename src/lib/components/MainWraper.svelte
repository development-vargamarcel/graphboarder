<script>
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	let gotIntrospectionData = false;
	$: gotIntrospectionData = $introspectionResult?.isReady;
</script>

<IntrospectionDataGenerator />
{#key gotIntrospectionData}
	{#if gotIntrospectionData}
		<slot />
	{/if}
{/key}
