<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { createClient, fetchExchange } from '@urql/core';
	import { browser } from '$app/environment';
	import { setClient, operationStore, query } from '@urql/svelte';
	import { urqlClient } from '$lib/utils/urqlClient';
	import { urqlCoreClient } from '$lib/utils/urqlCoreClient';
	import { getContext } from 'svelte';
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;

	const schemaData = QMSMainWraperContext?.schemaData;
	console.log({ endpointInfo }, $endpointInfo);
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

	urqlClient.set(client);
	urqlCoreClient.set(client);
	setClient(client);
	const queryStore = operationStore(`
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
  `);
	query(queryStore);
	let rootTypes = [];
	let queries = [];
	let mutations = [];
	let schema = {};
	let sortingInputValue = '';
	let sortingArray = [];
	$: sortingArray = sortingInputValue.split(' ');
	const handleData = () => {
		console.log('handledata run');
		schema = $queryStore?.data?.__schema;
		$schemaData.schema = schema;
		schemaData.set_fields(endpointInfo);
		$schemaData.isReady = true;
		console.log('schemaData', $schemaData);
	};
	$: if (!$queryStore.fetching) {
		if (queryStore?.data) {
			//console.log($queryStore?.data);
			handleData();
		} else if ($queryStore?.error) {
			console.log($queryStore?.error);
		} else {
			//console.log('no data');
		}
	}
</script>

{#if $queryStore?.data}
	<!-- content here -->
	<slot><!-- optional fallback --></slot>
{/if}
{#if $queryStore?.error}
	<!-- The button to open modal -->
	<!-- <label for="my-modal" class="btn">open modal</label> -->

	<!-- Put this part before </body> tag -->
	<input type="checkbox" checked id="my-modal" class="modal-toggle" />
	<div class="modal">
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
					<span>{$queryStore?.error}</span>
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
