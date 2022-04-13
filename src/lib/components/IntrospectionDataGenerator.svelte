<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { setClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import client from '$lib/utils/urql_client';
	import Type from '$lib/components/Type.svelte';
	import Types from '$lib/components/Types.svelte';
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
	let sortingInputValue = '';
	let sortingArray = [];
	$: sortingArray = sortingInputValue.split(' ');
	const handleData = () => {
		//handle rootTypes --
		rootTypes = [...$queryStore?.data?.__schema?.types];
		//sort
		rootTypes = rootTypes.sort((a, b) => {
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
		queries = rootTypes.find((type) => {
			return type?.name == 'Query';
		}).fields;
		//sort
		queries = queries.sort((a, b) => {
			if (a?.name < b?.name) {
				return -1;
			}
			if (a?.name > b?.name) {
				return 1;
			}
			return 0;
		});
		$introspectionResult.queryFields = queries;
		//handle mutations --
		mutations = rootTypes.find((type) => {
			return type?.name == 'Mutation';
		}).fields;
		//sort
		mutations = mutations.sort((a, b) => {
			if (a?.name < b?.name) {
				return -1;
			}
			if (a?.name > b?.name) {
				return 1;
			}
			return 0;
		});
		$introspectionResult.mutationFields = mutations;

		//output
	};
	$: if (!$queryStore.fetching) {
		console.log($queryStore?.data);
		handleData();
	}
</script>

<style>
</style>
