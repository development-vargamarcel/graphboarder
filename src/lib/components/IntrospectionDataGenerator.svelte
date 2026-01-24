<script module lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { endpointsSchemaData } from '$lib/stores/testData/endpointsSchemaData';
	import { createClient, fetchExchange } from '@urql/core';
	import { browser } from '$app/environment';
	import {  queryStore,gql,getContextClient  } from '@urql/svelte';
	import { getContext } from 'svelte';
	import { Logger } from '$lib/utils/logger';
	interface Props {
		prefix?: string;
		children?: import('svelte').Snippet;
	}

	let { prefix = '', children }: Props = $props();
	let QMSMainWraperContext = getContext<any>(`${prefix}QMSMainWraperContext`);
	const urqlCoreClient = QMSMainWraperContext?.urqlCoreClient;
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;

	Logger.debug({ endpointInfo }, $endpointInfo);
	const endpointInfoUrl = $endpointInfo?.Url;
	const getStoredSchemaData = (endpointInfoUrl) => {
		return endpointsSchemaData.find((item) => item.url === endpointInfoUrl);
	};
	const storedSchemaData = getStoredSchemaData(endpointInfoUrl);
	if (storedSchemaData) {
		$schemaData = storedSchemaData;
	}
	//setClient(urqlCoreClient);
  //ds
	const queryStoreRes = queryStore({
		client: getContextClient(),
		query:gql`
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
                  }
                }
              }
            }
          }
        }
      }
    }
  `});
	// if (!storedSchemaData) {
	// 	query(queryStoreRes);
	// }
	let rootTypes = [];
	let queries = [];
	let mutations = [];
	let schema = {};
	let sortingInputValue = '';
	let sortingArray = $state([]);
	$effect(() => {
		sortingArray = sortingInputValue.split(' ');
	});
	$schemaData = {};
	$schemaData.isReady = false;
	const handleData = () => {
		Logger.debug('handledata run');
		schema = $queryStoreRes?.data?.__schema;
		Logger.debug('ppppp', endpointInfo, schema);
		$schemaData.schema = schema;
		schemaData.set_fields(endpointInfo);
		Logger.debug('schemaData', $schemaData);
	};
	$effect(() => {
		Logger.debug({$queryStoreRes})
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
