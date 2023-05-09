<script lang="ts">
	import MainWraper from '$lib/components/MainWraper.svelte';
	import type { LayoutData } from './$types';
	//!!Q
	export const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import { localEndpoints, stigifyAll } from '$lib/stores/testData/testEndpoints';

	export let data: LayoutData;
	const endpointInfoProvided = localEndpoints.find((endpoint) => endpoint.id == 'nhost');
	//console.log('endpointInfoProvided json', stigifyAll(endpointInfoProvided));
</script>

<MainWraper {endpointInfoProvided}>
	<slot><!-- optional fallback --></slot>
</MainWraper>
