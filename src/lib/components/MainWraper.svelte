<script>
	import { getContext } from 'svelte';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';

	const endpointInfo = getContext('endpointInfo');
	let gotIntrospectionData;
	let introspectionResultUnsubscribe = introspectionResult.subscribe((data) => {
		if (data?.rootTypes.length > 0) {
			gotIntrospectionData = true;
			//console.log('introspectionResult', data);
		}
	});
</script>

<IntrospectionDataGenerator />
{#if gotIntrospectionData}
	<slot />
{/if}
