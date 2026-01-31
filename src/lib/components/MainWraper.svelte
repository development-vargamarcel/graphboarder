<!--
	@component
	The MainWraper component initializes the GraphQL client and schema data for a specific endpoint.
	It sets up the context for child components to access endpoint information and the URQL client.
-->
<script lang="ts">
	import { create_endpointInfo_Store } from '$lib/stores/endpointHandling/endpointInfo';
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';
	import { create_schemaData } from '$lib/stores/endpointHandling/schemaData';

	import { setContext, untrack } from 'svelte';
	import { Client, fetchExchange, setContextClient } from '@urql/svelte';
	import { browser } from '$app/environment';
	import { Create_urqlCoreClient } from '$lib/utils/urqlCoreClient';
	import { Logger } from '$lib/utils/logger';
	import type { QMSMainWraperContext } from '$lib/types/index';
	import ToastContainer from './UI/ToastContainer.svelte';

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
	// Initialize with the provided prop value immediately so the client has the correct URL on startup.
	// Using untrack to avoid "state referenced locally" warning as this is initialization logic
	const endpointInfo = create_endpointInfo_Store(untrack(() => endpointInfoProvided));
	const schemaData = create_schemaData();

	// Update store when prop changes (for reactivity if the prop updates later)
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

	/**
	 * Retrieves headers for the GraphQL client, merging provided headers with those stored in localStorage.
	 * Priorities: localStorage (specific > global) > endpointInfo.headers
	 */
	let getHeaders = () => {
		let headers: Record<string, string> = {};

		// Start with provided headers
		if ($endpointInfo?.headers) {
			headers = { ...$endpointInfo.headers };
		}

		if (browser) {
			// Check for global headers first
			const globalHeaders = localStorage.getItem('headers');
			if (globalHeaders) {
				try {
					headers = { ...headers, ...JSON.parse(globalHeaders) };
				} catch (e) {
					Logger.error('MainWraper: Failed to parse global headers from localStorage', e);
				}
			}

			// Check for endpoint-specific headers (overrides global)
			if ($endpointInfo?.id) {
				const specificHeaders = localStorage.getItem(`headers_${$endpointInfo.id}`);
				if (specificHeaders) {
					try {
						headers = { ...headers, ...JSON.parse(specificHeaders) };
					} catch (e) {
						Logger.error(`MainWraper: Failed to parse specific headers for ${$endpointInfo.id}`, e);
					}
				}
			}
		}
		return headers;
	};

	const urqlCoreClient = Create_urqlCoreClient();

	// Client creation depends on $endpointInfo.url which is a store value.
	// We use $effect to recreate the client whenever the URL changes.
	let client = $state<Client>(
		new Client({
			url: untrack(() => $endpointInfo.url) || 'http://localhost/graphql', // Default to avoid crash if empty
			fetchOptions: () => {
				return {
					headers: getHeaders()
				};
			},
			exchanges: [fetchExchange]
		})
	);

	// Sync client to urqlCoreClient store initially
	urqlCoreClient.set(untrack(() => client));
	setContextClient(untrack(() => client));

	$effect(() => {
		const url = $endpointInfo.url;
		const currentClientUrl = untrack(() => (client as any).url);
		if (url && url !== currentClientUrl) {
			Logger.info('MainWraper: Recreating URQL Client due to URL change', { url });
			const newClient = new Client({
				url: url,
				fetchOptions: () => {
					return {
						headers: getHeaders()
					};
				},
				exchanges: [fetchExchange]
			});
			client = newClient;
			urqlCoreClient.set(newClient);
		}
	});

	// We capture the initial prefix for the context key. This is standard behavior.
	// Svelte 5 warns about capturing state locally, but for context keys it is expected.
	setContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`, {
		endpointInfo: endpointInfo,
		schemaData: schemaData,
		urqlCoreClient: urqlCoreClient
	});

	Logger.info('MainWraper initialized and context set', { prefix: untrack(() => prefix) });
</script>

<IntrospectionDataGenerator {prefix}>
	{@render children?.()}
	<ToastContainer />
</IntrospectionDataGenerator>
