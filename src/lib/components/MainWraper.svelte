<!--
	@component
	The MainWraper component initializes the GraphQL client and schema data for a specific endpoint.
	It sets up the context for child components to access endpoint information and the URQL client.
-->
<script lang="ts">
	import { create_endpointInfo_Store } from '$lib/stores/endpointHandling/endpointInfo';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { create_schemaData } from '$lib/stores/endpointHandling/schemaData';

	import { setContext } from 'svelte';
	import { createClient,  } from '@urql/core';
	import { browser } from '$app/environment';
	import { Create_urqlCoreClient } from '$lib/utils/urqlCoreClient';
	import { setContextClient,Client,fetchExchange } from '@urql/svelte';
	import { Logger } from '$lib/utils/logger';
	import type { QMSMainWraperContext } from '$lib/types/index';

	/**
	 * Props for the MainWraper component.
	 */
	interface Props {
		/**
		 * A prefix string to namespace the context, allowing multiple MainWrapers to coexist.
		 */
		prefix?: string;
		/**
		 * Initial configuration for the GraphQL endpoint (url, headers, etc.).
		 */
		endpointInfoProvided?: any;
		/**
		 * The content to render inside the wrapper.
		 */
		children?: import('svelte').Snippet;
	}

	let { prefix = '', endpointInfoProvided = null, children }: Props = $props();

	// Move reactive initialization after props
	const endpointInfo = create_endpointInfo_Store(endpointInfoProvided);
	const schemaData = create_schemaData();

	// Update store when prop changes
	$effect(() => {
		if (endpointInfoProvided) {
			endpointInfo.smartSet(endpointInfoProvided);
		}
	});

	Logger.debug('MainWraper initializing', { prefix, endpointInfoProvided });

	$effect(() => {
		if (!$endpointInfo?.url) {
			Logger.error('MainWraper: No URL provided in endpoint info. Please check your configuration.', { endpointInfoProvided });
		}
	});

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
			const headers = localStorage.getItem('headers');
			return headers ? JSON.parse(headers) : {};
		} else {
			return {};
		}
	};
	const urqlCoreClient = Create_urqlCoreClient();
	urqlCoreClient.set(client);

	setContextClient(client);
	setContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`, {
		endpointInfo: endpointInfo,
		schemaData: schemaData,
		urqlCoreClient: urqlCoreClient
	});

	Logger.info('MainWraper initialized and context set', { prefix });
</script>

<IntrospectionDataGenerator {prefix}>
	{@render children?.()}
</IntrospectionDataGenerator>
