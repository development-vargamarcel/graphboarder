<script lang="ts">
	import MainWraper from '$lib/components/MainWraper.svelte';
	import type { LayoutData } from './$types';
	import type { QMSMainWraperContext } from '$lib/types/index';
	//!!Q
	export const prefix = '';
	let QMSMainWraperContext_Value = getContext<QMSMainWraperContext>(
		`${prefix}QMSMainWraperContext`
	);
	const schemaData = QMSMainWraperContext_Value?.schemaData;
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
	// Note: persisted() handles localStorage access internally (only in browser),
	// so we just provide a default value for SSR. The store will hydrate from
	// localStorage automatically on the client side.
	export const localStorageEndpoints = persisted('localStorageEndpoints', []);
	setContext('localStorageEndpoints', localStorageEndpoints);
</script>

{@render children?.()}
<!-- <MainWraper {endpointInfoProvided}>
</MainWraper> -->
