<script lang="ts">
	import { create_endpointInfo_Store } from '$lib/stores/endpointHandling/endpointInfo';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { create_schemaData } from '$lib/stores/endpointHandling/schemaData';

	import { setContext } from 'svelte';
	export let prefix = '';
	export let endpointInfoProvided = null;

	let endpointInfo = create_endpointInfo_Store(endpointInfoProvided);

	const schemaData = create_schemaData();
	setContext(`${prefix}QMSMainWraperContext`, {
		endpointInfo: endpointInfo,
		schemaData: schemaData
	});
	$: console.log('schemaData', $schemaData?.isReady);
</script>

<IntrospectionDataGenerator>
	<slot />
	<div>qq</div>
</IntrospectionDataGenerator>
