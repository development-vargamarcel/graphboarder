<script lang="ts">
	import { create_endpointInfo_Store } from '$lib/stores/endpointHandling/endpointInfo';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { create_schemaData } from '$lib/stores/endpointHandling/schemaData';

	import { setContext } from 'svelte';
	import { createClient,  } from '@urql/core';
	import { browser } from '$app/environment';
	import { Create_urqlCoreClient } from '$lib/utils/urqlCoreClient';
	import { setContextClient,Client,fetchExchange } from '@urql/svelte';
	interface Props {
		prefix?: string;
		endpointInfoProvided?: any;
		children?: import('svelte').Snippet;
	}

	let { prefix = '', endpointInfoProvided = null, children }: Props = $props();

	const endpointInfo = create_endpointInfo_Store(endpointInfoProvided);
	const schemaData = create_schemaData();

	let client = new Client({
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

	setContextClient(client);
	setContext(`${prefix}QMSMainWraperContext`, {
		endpointInfo: endpointInfo,
		schemaData: schemaData,
		urqlCoreClient: urqlCoreClient
	});
</script>

<IntrospectionDataGenerator>
	{@render children?.()}
</IntrospectionDataGenerator>
