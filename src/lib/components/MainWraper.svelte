<script lang="ts">
	import { create_endpointInfo_Store } from '$lib/stores/endpointHandling/endpointInfo';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { create_schemaData } from '$lib/stores/endpointHandling/schemaData';

	import { setContext } from 'svelte';
	import { createClient, fetchExchange } from '@urql/core';
	import { browser } from '$app/environment';
	import { Create_urqlCoreClient } from '$lib/utils/urqlCoreClient';
	import { setClient } from '@urql/svelte';
	export let prefix = '';
	export let endpointInfoProvided = null;

	const endpointInfo = create_endpointInfo_Store(endpointInfoProvided);
	const schemaData = create_schemaData();

	$: console.log('schemaData', $schemaData?.isReady);
	let client = createClient({
		url: $endpointInfo.url,
		fetchOptions: () => {
			return {
				headers: getHeaders()
			};
		},
		exchanges: [fetchExchange]
	});

	let getHeaders = () => {
		if ($endpointInfo?.headers) {
			return $endpointInfo?.headers;
		}
		if (browser) {
			return JSON.parse(localStorage.getItem('headers'));
		} else {
			return {};
		}
	};
	const urqlCoreClient = Create_urqlCoreClient();
	urqlCoreClient.set(client);

	setClient(client);
	setContext(`${prefix}QMSMainWraperContext`, {
		endpointInfo: endpointInfo,
		schemaData: schemaData,
		urqlCoreClient: urqlCoreClient
	});
</script>

<IntrospectionDataGenerator>
	<slot />
	<div>qq</div>
</IntrospectionDataGenerator>
