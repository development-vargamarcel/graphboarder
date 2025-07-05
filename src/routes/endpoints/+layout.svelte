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

<MainWraper {endpointInfoProvided}>
	{#if children}{@render children()}{:else}<!-- optional fallback -->{/if}
</MainWraper>
