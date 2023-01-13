<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { createClient, fetchExchange } from '@urql/core';
	import { browser } from '$app/environment';
	import { setClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import { urqlClient } from '$lib/stores/urqlClient';
	import { urqlCoreClient } from '$lib/stores/urqlCoreClient';
	import { schemaData } from '$lib/stores/schemaData';
	import { getContext } from 'svelte';

	const endpointInfo = getContext('endpointInfo');
	export let graphqlEndpointURL = $endpointInfo.url;

	let client = createClient({
		url: graphqlEndpointURL,
		fetchOptions: () => {
			return {
				headers: getHeaders()
			};
		},
		exchanges: [fetchExchange]
	});

	let getHeaders = () => {
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
		schema = $queryStore?.data?.__schema;
		$schemaData.schema = schema;
		schemaData.set_fields();
		$schemaData.isReady = true;
		introspectionResult.set($schemaData);
	};
	$: if (!$queryStore.fetching) {
		if (queryStore?.data) {
			//console.log($queryStore?.data);
			handleData();
		} else if ($queryStore?.error) {
			//console.log($queryStore?.error);
		} else {
			//console.log('no data');
		}
	}
</script>

<style>
</style>
