<script lang="ts">
	import { endpointInfo } from '$lib//stores/endpointInfo/endpointInfo';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import { setContext } from 'svelte';
	export let endpointInfoProvided = null;
	if (endpointInfoProvided) {
		endpointInfo.smartSet(endpointInfoProvided);
		setContext('endpointInfo', endpointInfo);
	}

	let gotIntrospectionData = false;
	$: gotIntrospectionData = $introspectionResult?.isReady;
</script>

<IntrospectionDataGenerator />
{#key gotIntrospectionData}
	{#if gotIntrospectionData}
		<slot />
	{/if}
{/key}
