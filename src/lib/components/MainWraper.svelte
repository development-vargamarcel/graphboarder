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
	import { Client, fetchExchange, setContextClient } from '@urql/svelte';
	import { browser } from '$app/environment';
	import { Create_urqlCoreClient } from '$lib/utils/urqlCoreClient';
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

	// Initialize stores
	// We pass null initially to avoid capturing the prop synchronously, avoiding 'state_referenced_locally' warning.
	// The $effect below will populate it.
	const endpointInfo = create_endpointInfo_Store(null);
	const schemaData = create_schemaData();

	// Update store when prop changes
	$effect(() => {
		if (endpointInfoProvided) {
			endpointInfo.smartSet(endpointInfoProvided);
		}
	});

	$effect(() => {
		Logger.debug('MainWraper initializing', { prefix, endpointInfoProvided });
	});

	$effect(() => {
		if (!$endpointInfo?.url) {
			Logger.error('MainWraper: No URL provided in endpoint info. Please check your configuration.', { endpointInfoProvided });
		}
	});

	// Client creation depends on $endpointInfo.url which is a store value.
	// Since client is created once, it might not react to url changes unless we recreate it.
	// But URQL Client usually isn't recreated. We assume URL is stable after init.
	// To make it reactive, we would need to recreate the client, but setContextClient is usually done once.
	// We'll keep it as is but be aware.
	let client = new Client({
		url: $endpointInfo.url || 'http://localhost/graphql', // Default to avoid crash if empty
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

	// We capture the initial prefix for the context key. This is standard behavior.
	// Svelte 5 warns about capturing state locally, but for context keys it is expected.
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
