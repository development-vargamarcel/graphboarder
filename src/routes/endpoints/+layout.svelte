<script lang="ts">
	import MainWraper from '$lib/components/MainWraper.svelte';
	import type { LayoutData } from './$types';
	import {
		getRootType,
		getSortedAndOrderedEndpoints,
		stringToJs
	} from '$lib/utils/usefulFunctions';
	import { getContext, setContext } from 'svelte';
	import { localEndpoints, stigifyAll } from '$lib/stores/testData/testEndpoints';
	import { persisted } from 'svelte-persisted-store';

	//!!Q
	export const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	const endpointInfoProvided = localEndpoints.find((endpoint) => endpoint.id == 'nhost');
	//console.log('endpointInfoProvided json', stigifyAll(endpointInfoProvided));
	export const localStorageEndpoints = persisted(
		'localStorageEndpoints',
		getSortedAndOrderedEndpoints(stringToJs(localStorage.getItem('endpoints') || []))
	);
	setContext('localStorageEndpoints', localStorageEndpoints);
</script>

{#if children}{@render children()}{:else}<!-- optional fallback -->{/if}
<!-- <MainWraper {endpointInfoProvided}>
</MainWraper> -->
