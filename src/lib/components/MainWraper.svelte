<script lang="ts">
	import {
		create_endpointInfo_Store,
		endpointInfo
	} from '$lib/stores/endpointHandling/endpointInfo';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { schemaData } from '$lib/stores/endpointHandling/schemaData';
	import { setContext } from 'svelte';
	export let prefix = '';
	export let endpointInfoProvided = null;
	let endpointInfo_Store;
	if (endpointInfoProvided) {
		endpointInfo_Store = create_endpointInfo_Store(endpointInfoProvided);
	} else {
		endpointInfo_Store = create_endpointInfo_Store(null);
	}
	setContext(`${prefix}QMSMainWraperContext`, { endpointInfo: endpointInfo_Store });

	let gotIntrospectionData = false;
	$: gotIntrospectionData = $schemaData?.isReady;
</script>

<IntrospectionDataGenerator />
{#key gotIntrospectionData}
	{#if gotIntrospectionData && $endpointInfo_Store}
		{$endpointInfo_Store?.url}
		<slot />
	{/if}
{/key}
