<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	////
	import { onDestroy, setContext } from 'svelte';
	export let graphqlEndpointURL = 'https://mdunpmb9.directus.app/graphql';

	//import { createClient, fetchExchange } from '@urql/svelte';
	import { createClient, fetchExchange } from '@urql/core';
	import { amp, browser, dev, mode, prerendering } from '$app/env';
	let client = createClient({
		url: graphqlEndpointURL,
		fetchOptions: () => {
			console.log('getHeaders() run', getHeaders());
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

	///
	import { setClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';

	import { urqlClient } from '$lib/stores/urqlClient';
	import { urqlCoreClient } from '$lib/stores/urqlCoreClient';
	import { schemaData } from '$lib/stores/schemaData';
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

	schemaData.subscribe((value) => {
		console.log('schemaData value', value);
	});

	const handleData = () => {
		//handle schema --
		schema = $queryStore?.data?.__schema;
		$introspectionResult.schema = schema;
		//-------
		$schemaData.schema = schema;
		//-------
		//handle rootTypes --
		//-------
		schemaData.set_rootTypes();
		//-------
		rootTypes = [...$queryStore?.data?.__schema?.types];
		//sort
		rootTypes = rootTypes?.sort((a, b) => {
			if (a?.name < b?.name) {
				return -1;
			}
			if (a?.name > b?.name) {
				return 1;
			}
			return 0;
		});
		$introspectionResult.rootTypes = rootTypes;
		//handle queries --
		if (schema?.queryType?.name) {
			queries = rootTypes?.find((type) => {
				return type?.name == schema?.queryType?.name;
			})?.fields;
			//sort
			queries = queries?.sort((a, b) => {
				if (a?.name < b?.name) {
					return -1;
				}
				if (a?.name > b?.name) {
					return 1;
				}
				return 0;
			});
			$introspectionResult.queryFields = queries;
		}
		//handle mutations --
		if (schema?.mutationType?.name) {
			mutations = rootTypes?.find((type) => {
				return type?.name == schema?.mutationType?.name;
			})?.fields;
			//sort
			mutations = mutations?.sort((a, b) => {
				if (a?.name < b?.name) {
					return -1;
				}
				if (a?.name > b?.name) {
					return 1;
				}
				return 0;
			});
			$introspectionResult.mutationFields = mutations;
		}

		//output
	};
	$: if (!$queryStore.fetching) {
		if (queryStore?.data) {
			console.log($queryStore?.data);
			handleData();
		} else if ($queryStore?.error) {
			console.log($queryStore?.error);
		} else {
			console.log('no data');
		}
	}
</script>

<style>
</style>
