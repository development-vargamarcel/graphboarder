<script lang="ts">
	//testing

	//testing

	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';

	import '../app.postcss';
	import { introspectionResult } from '$lib/stores/introspectionResult';

	//TODO:
	//id field naming convention possibilities
	//countLocationPossibilities

	//rowsLocationPossibilities is important for other things too in edgeBased pagination
	let testEndpoints = [
		{
			url: 'https://vgqkcskomrpikolllkix.nhost.run/v1/graphql',
			description: 'offsetBased pagination',
			headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
			rowsLocationPossibilities: [
				{
					rowsLocation: ['aggregate'],
					checker: (QMS_Info) => {
						return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
					}
				},
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
					}
				}
			]
		},

		{
			url: 'https://7rsm0d0d.directus.app/graphql',
			description: 'offsetBased pagination',
			headers: {
				authorization: 'Bearer aKUvsqBR4-rfnL2z6nqEQmLPRIur4c1m'
			},
			rowsLocationPossibilities: [
				{
					rowsLocation: [], //'countDistinct'
					checker: (QMS_Info) => {
						return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
					}
				},
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
					}
				}
			]
		},
		{
			url: 'https://api.spacex.land/graphql/',
			description: 'offsetBased pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: ['nodes'],
					checker: (QMS_Info) => {
						return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
					}
				},
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
					}
				}
			]
		},
		{
			url: 'https://rickandmortyapi.com/graphql',
			description: 'pageBased pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: ['results'],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://vgqkcskomrpikolllkix.nhost.run/v1beta1/relay',
			description: 'edgeBased pagination',
			headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
			pageInfoFieldsLocation: ['pageInfo'],

			rowsLocationPossibilities: [
				{
					rowsLocation: ['edges'],
					checker: (QMS_Info) => {
						return true;
					}
				}
			],
			namings: {
				hasNextPage: 'hasNextPage',
				hasPreviousPage: 'hasPreviousPage',
				startCursor: 'startCursor',
				endCursor: 'endCursor',
				cursor: 'cursor'
			}
		},
		{
			url: 'https://portal.ehri-project.eu/api/graphql',
			description: 'edgeBased pagination',
			pageInfoFieldsLocation: ['pageInfo'],
			rowsLocationPossibilities: [
				{
					rowsLocation: ['edges'],
					checker: (QMS_Info) => {
						return true;
					}
				}
			],
			namings: {
				hasNextPage: 'hasNextPage',
				hasPreviousPage: 'hasPreviousPage',
				startCursor: 'previousPage',
				endCursor: 'nextPage',
				cursor: 'cursor'
			}
		},
		{
			url: 'https://gitlab.com/api/graphql',
			description: 'edgeBased pagination',
			pageInfoFieldsLocation: ['pageInfo'],
			rowsLocationPossibilities: [
				{
					rowsLocation: ['edges'],
					checker: (QMS_Info) => {
						return true;
					}
				}
			],
			namings: {
				hasNextPage: 'hasNextPage',
				hasPreviousPage: 'hasPreviousPage',
				startCursor: 'startCursor',
				endCursor: 'endCursor',
				cursor: 'cursor'
			}
		},
		{
			url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
			authToken: '',
			description: 'edgeBased pagination',
			pageInfoFieldsLocation: ['pageInfo'],
			rowsLocationPossibilities: [
				{
					rowsLocation: ['edges'],
					checker: (QMS_Info) => {
						return true;
					}
				}
			],
			namings: {
				hasNextPage: 'hasNextPage',
				hasPreviousPage: 'hasPreviousPage',
				startCursor: 'startCursor',
				endCursor: 'endCursor',
				cursor: 'cursor'
			}
		},
		{
			url: 'https://graphql.fauna.com/graphql',
			description: 'edgeBased pagination',
			pageInfoFieldsLocation: [],
			rowsLocationPossibilities: [
				{
					rowsLocation: ['data'],
					checker: (QMS_Info) => {
						return true;
					}
				}
			],
			namings: {
				startCursor: 'after',
				endCursor: 'before'
			},
			headers: {
				authorization: 'Basic Zm5BRFFVdWNRb0FDQ1VpZDAxeXVIdWt2SnptaVY4STI4a2R6Y0p2UDo='
			}
		},
		{ url: 'https://graphql-camara-deputados.herokuapp.com/', description: 'edgeBased pagination' },
		{
			url: 'https://countries.trevorblades.com/',
			description: 'notAvailable pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://dex-server.herokuapp.com/',
			description: '?? notAvailable pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://graphql.anilist.co',
			description: '?? notAvailable pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql',
			description: '?? notAvailable pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://etmdb.com/graphql?',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://api.graphql.jobs/',
			description: 'notAvailable pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://demotivation-quotes-api.herokuapp.com/graphql',
			description: 'notAvailable pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://graphql-weather-api.herokuapp.com/',
			description: 'notAvailable pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://fruits-api.netlify.app/graphql',
			description: 'notAvailable pagination',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://graphql-compose.herokuapp.com/northwind/',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://directions-graphql.herokuapp.com/graphql',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://beta.pokeapi.co/graphql/v1beta',
			rowsLocationPossibilities: [
				{
					rowsLocation: ['aggregate'],
					checker: (QMS_Info) => {
						return QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
					}
				},
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return !QMS_Info.dd_displayName.toLowerCase().endsWith('aggregated');
					}
				}
			]
		},
		{
			url: 'https://hivdb.stanford.edu/graphql',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://api.react-finland.fi/graphql?',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://graphqlpokemon.favware.tech/',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		},
		{
			url: 'https://graphbrainz.herokuapp.com/?',
			rowsLocationPossibilities: [
				{
					rowsLocation: [],
					checker: (QMS_Info) => {
						return true;
					}
				}
			]
		}
	];
	let gotData = false;
	let introspectionResultUnsubscribe = introspectionResult.subscribe((data) => {
		if (data?.rootTypes.length > 0) {
			gotData = true;
			//console.log('introspectionResult', data);
		}
	});

	////////////////////

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	let showEdit = false;
	let show_IntrospectionDataGenerator = true;
	let graphqlEndpointURL = '';
	let headersValue = '';
	let editText = 'edit';

	const store_headers = () => {
		if (headersValue == '' || headersValue == undefined) {
			localStorage.removeItem('headers');
		} else {
			let headersOneObj = {};
			let headers = headersValue?.split('\n').forEach((el) => {
				let currHeader = el.split(':');
				if (currHeader[0] && currHeader[1]) {
					headersOneObj[currHeader[0]] = currHeader[1];
				}
			});

			localStorage.setItem('headers', JSON.stringify(headersOneObj));
		}
	};

	if (browser && localStorage.getItem('graphqlEndpointURL')) {
		graphqlEndpointURL = localStorage.getItem('graphqlEndpointURL');
	}
	if (browser && localStorage.getItem('headers')) {
		let localStorage_headersValue = JSON.parse(localStorage.getItem('headers'));
		let localStorage_headersValue_Entries = Object.entries(localStorage_headersValue);
		headersValue = localStorage_headersValue_Entries
			.map((el) => {
				return el[0] + ':' + el[1];
			})
			.join('\n');
	}

	const store_graphqlEndpointURL = () => {
		//console.log(graphqlEndpointURL);
		if (graphqlEndpointURL == '') {
			localStorage.removeItem('graphqlEndpointURL');
		} else {
			localStorage.setItem('graphqlEndpointURL', graphqlEndpointURL);
		}
	};

	const storeAll = () => {
		goto('/queries');
		store_headers();
		store_graphqlEndpointURL();
		editButtonClick();
	};
	const deleteAll = () => {
		graphqlEndpointURL = '';

		localStorage.removeItem('headers');
		localStorage.removeItem('graphqlEndpointURL');
	};
	const editButtonClick = () => {
		if (editText == 'edit') {
			editText = 'done';
		} else {
			editText = 'edit';
		}
		if (!showEdit) {
			gotData = false;
		}

		showEdit = !showEdit;
		show_IntrospectionDataGenerator = !show_IntrospectionDataGenerator;
	};
	if (!graphqlEndpointURL) {
		editButtonClick();
	}

	const handleEndpointClick = (endpoint) => {
		let headers = endpoint?.headers;
		if (headers) {
			let headersKeys = Object.keys(headers);
			let headersNames = headersKeys.map((key) => {
				return `${key}:${headers[key]}`;
			});
			headersValue = headersNames.join('\n');
		} else {
			headersValue = '';
		}

		graphqlEndpointURL = endpoint?.url;
	};
	let forceVisibleSidebar = false;
	import { clickOutside } from '$lib/actions/clickOutside';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { endpointInfo } from '$lib/stores/endpointInfo/endpointInfo';
	import { setContext } from 'svelte';
	setContext('endpointInfo', endpointInfo);
	$: if (gotData) {
		if ($endpointInfo?.url != graphqlEndpointURL) {
			endpointInfo.set(
				testEndpoints.find((endpoint) => {
					return endpoint.url == graphqlEndpointURL;
				})
			);
		}
	}
</script>

<header />
{#if graphqlEndpointURL && graphqlEndpointURL !== ''}
	{#if show_IntrospectionDataGenerator}
		<IntrospectionDataGenerator {graphqlEndpointURL} />
		{#if gotData}
			<main class="bg-base-300  flex w-[100vw] overflow-hidden">
				<div class="  md:max-w-[300px]">
					{#if $endpointInfo}
						<Sidebar bind:forceVisibleSidebar />
					{/if}
				</div>
				<div class="flex flex-col w-full md:w-[65vw]   grow h-screen">
					<div class=" bg-base-100 min-h-[50px] flex">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label
							class="btn btn-square btn-ghost  md:hidden"
							on:click={() => {
								forceVisibleSidebar = true;
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								class="inline-block w-6 h-6 stroke-current "
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/></svg
							>
						</label>
						<div />
					</div>
					{#if $endpointInfo}
						<slot />
					{/if}
				</div>
			</main>
		{/if}
	{/if}
{/if}

{#if showEdit}
	<div
		class="fixed bottom-0 bg-base-200 w-screen h-screen overscroll-none overflow-y-auto pb-4 px-4 mx-auto"
	>
		<div class="form-control w-full max-w-xs md:max-w-md lg:max-w-lg mt-32 mx-auto">
			<ul class="space-y-2 max-h-60 md:max-h-80   overflow-y-auto px-1 overscroll-contain">
				{#each testEndpoints as endpoint}
					<li
						class="cursor-pointer bg-accent/5 p-2 rounded overflow-x-auto break-all {endpoint.url ==
						graphqlEndpointURL
							? 'bg-accent/50'
							: ''}"
						on:click={() => {
							handleEndpointClick(endpoint);
						}}
					>
						{endpoint.url}
						<div class="text-xs">{endpoint.description ? endpoint.description : ''}</div>
					</li>
				{/each}
			</ul>
			<div class="divider">or</div>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">graphqlEndpointURL</span>
			</label>
			<input
				type="text"
				placeholder="Type here"
				class="input input-bordered input-sm w-full max-w-xs md:max-w-md lg:max-w-lg"
				bind:value={graphqlEndpointURL}
			/>

			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<span class="label-text">headers</span>
			</label>

			<textarea
				type="textarea"
				cols="40"
				placeholder="header:value"
				class="textarea textarea-bordered textarea-sm overflow-x-auto w-full max-w-xs md:max-w-md lg:max-w-lg"
				bind:value={headersValue}
			/>

			<button class="btn bg-primary btn-sm normal-case w-content-min mt-2" on:click={storeAll}
				>apply</button
			>
			<button class="btn bg-warning btn-sm normal-case w-content-min mt-10" on:click={deleteAll}
				>delete all</button
			>
		</div>
	</div>
{/if}

<div class="fixed bottom-14 right-2 pr-1">
	<button class="btn btn-sm " on:click={editButtonClick}>{editText}</button>
</div>
<footer />

<style>
</style>
