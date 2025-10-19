<script lang="ts">
	import MainWraper from '$lib/components/MainWraper.svelte';
	import type { LayoutData } from './$types';
	//!!Q
	export const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	import {
		getRootType,
		getSortedAndOrderedEndpoints,
		stringToJs
	} from '$lib/utils/usefulFunctions';
	import { getContext, setContext } from 'svelte';
	import { localEndpoints, stigifyAll } from '$lib/stores/testData/testEndpoints';
	import { persisted } from 'svelte-persisted-store';

	export let data: LayoutData;
	const endpointInfoProvided = localEndpoints.find((endpoint) => endpoint.id == 'nhost');
	//console.log('endpointInfoProvided json', stigifyAll(endpointInfoProvided));
	export const localStorageEndpoints = persisted(
		'localStorageEndpoints',
		getSortedAndOrderedEndpoints(stringToJs(localStorage.getItem('endpoints') || []))
	);
	setContext('localStorageEndpoints', localStorageEndpoints);
</script>

<slot><!-- optional fallback --></slot>
<!-- <MainWraper {endpointInfoProvided}>
</MainWraper> -->
