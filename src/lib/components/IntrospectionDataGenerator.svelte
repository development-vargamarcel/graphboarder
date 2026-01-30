<script module lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { endpointsSchemaData } from '$lib/stores/testData/endpointsSchemaData';
	import { fetchExchange } from '@urql/core';
	import { browser } from '$app/environment';
	import { queryStore, gql, getContextClient } from '@urql/svelte';
	import { getContext, untrack } from 'svelte';
	import { Logger } from '$lib/utils/logger';
	import type { QMSMainWraperContext } from '$lib/types/index';

	interface Props {
		prefix?: string;
		children?: import('svelte').Snippet;
	}

	let { prefix = '', children }: Props = $props();

	// Get context with explicit type
	let QMSMainWraperContextVal = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	const urqlCoreClient = QMSMainWraperContextVal?.urqlCoreClient;
	const endpointInfo = QMSMainWraperContextVal?.endpointInfo;
	const schemaData = QMSMainWraperContextVal?.schemaData;

	$effect(() => {
		Logger.debug({ endpointInfo }, $endpointInfo);
	});

	let endpointInfoUrl = $derived($endpointInfo?.url);

	const getStoredSchemaData = (endpointInfoUrl: string | undefined) => {
		if (!endpointInfoUrl) return undefined;
		return endpointsSchemaData.find((item) => item.url === endpointInfoUrl);
	};

	let storedSchemaData = $derived(getStoredSchemaData(endpointInfoUrl));

	$effect(() => {
		if (storedSchemaData && schemaData) {
			// This might need type adjustment if storedSchemaData doesn't match SchemaData perfectly
			schemaData.set(storedSchemaData as any);
		}
	});

	//ds
	const queryStoreRes = queryStore({
		client: getContextClient(),
		query: gql`
    query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
        directives {
          name
          description
          locations
          args {
            ...InputValue
          }
        }
      }
    }

    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }

    fragment InputValue on __InputValue {
      name
      description
      type { ...TypeRef }
      defaultValue
    }

    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                        ofType {
                          kind
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `
	});

	let schema = $state({});

	const handleData = () => {
		// Prevent infinite loop if data is already processed
		if ($schemaData.isReady) {
			return;
		}
		Logger.debug('handledata run');
		schema = $queryStoreRes?.data?.__schema;
		Logger.debug('ppppp', $endpointInfo, schema); // Fixed: use store value
		if (schemaData.set_schema) {
			schemaData.set_schema(schema);
		} else {
			schemaData.update(s => ({ ...s, schema }));
		}

		schemaData.set_fields(endpointInfo);
		Logger.debug('schemaData', $schemaData); // Fixed: use store value
	};

	$effect(() => {
		Logger.debug({ queryStoreRes: $queryStoreRes });
	});

	$effect(() => {
		if (!$queryStoreRes.fetching) {
			if ($queryStoreRes?.data) {
				Logger.debug('Introspection Data received', $queryStoreRes?.data);
				handleData();
			} else if ($queryStoreRes?.error) {
				Logger.error('Introspection Error', $queryStoreRes?.error);
			} else {
				Logger.warn('Introspection: no data');
			}
		}
	});
</script>

{#if ($queryStoreRes?.data || storedSchemaData) && $schemaData.isReady}
	<!-- content here -->
	{@render children?.()}
{/if}
{#if $queryStoreRes?.error}
	<!-- The button to open modal -->
	<!-- <label for="my-modal" class="btn">open modal</label> -->

	<!-- Put this part before </body> tag -->
	<input type="checkbox" checked id="my-modal" class="modal-toggle" />
	<div class="modal" role="dialog" aria-modal="true">
		<div class="modal-box">
			<div class="alert alert-error shadow-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current flex-shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
					<span>{$queryStoreRes?.error}</span>
				</div>
			</div>
			<div class="alert alert-info shadow-lg mt-4">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="stroke-current flex-shrink-0 w-6 h-6"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
					<span>Please check your endpoint.</span>
				</div>
			</div>
			<div class="modal-action">
				<label for="my-modal" class="btn">close</label>
			</div>
		</div>
	</div>
{/if}

<style>
</style>
