<script lang="ts">
	import { endpointInfo } from '$lib/stores/endpointInfo';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { schemaData } from '$lib/stores/schemaData';
	import { setContext } from 'svelte';
	export let endpointInfoProvided = null;
	if (endpointInfoProvided) {
		endpointInfo.smartSet(endpointInfoProvided);
		setContext('endpointInfo', endpointInfo);
	}

	let gotIntrospectionData = false;
	$: gotIntrospectionData = $schemaData?.isReady;
</script>

<IntrospectionDataGenerator />
{#key gotIntrospectionData}
	{#if gotIntrospectionData}
		<slot />
	{/if}
{/key}
