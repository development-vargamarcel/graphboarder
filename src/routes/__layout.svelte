<script lang="ts">
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';

	import Header from '$lib/header/Header.svelte';
	import '../app.css';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	let testEndpoints = [
		{
			url: 'https://mdunpmb9.directus.app/graphql',
			headers: {
				authorization: 'Bearer kdjskhfdkjshfdsfkljdshfkjdhsfk7u4y3f3h8rhef347hh4ueihf8934h'
			}
		},
		{ url: 'https://api.spacex.land/graphql/' },
		{ url: 'https://swapi-graphql.netlify.app/.netlify/functions/index', authToken: '' },
		{ url: 'https://rickandmortyapi.com/graphql' },
		{ url: 'https://beta.pokeapi.co/graphql/v1beta' },
		{ url: 'https://dex-server.herokuapp.com/' },
		{ url: 'https://graphql.anilist.co' },
		{
			url: 'https://vgqkcskomrpikolllkix.nhost.run/v1/graphql',
			headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' }
		}
	];
	let gotData = false;
	let introspectionResultUnsubscribe = introspectionResult.subscribe((data) => {
		if (data?.rootTypes.length > 0) {
			gotData = true;
		}
	});

	////////////////////

	import { browser } from '$app/env';
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
	const store_graphqlEndpointURL = () => {
		console.log(graphqlEndpointURL);
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
</script>

<header />

<main class="bg-base-300 w-full w-min-max overflow-x-auto">
	{#if graphqlEndpointURL && graphqlEndpointURL !== ''}
		{#if show_IntrospectionDataGenerator}
			{#if gotData}
				<slot />
			{/if}
			<IntrospectionDataGenerator {graphqlEndpointURL} />
		{/if}
	{/if}
	{#if showEdit}
		<div
			class="fixed bottom-0 bg-base-200 w-screen h-screen overscroll-none overflow-y-auto pb-4 px-4 mx-auto"
		>
			<div class="form-control w-full max-w-xs mt-40">
				<ul class="space-y-2 max-h-40 overflow-y-auto px-1 overscroll-contain">
					{#each testEndpoints as endpoint}
						<li
							class="cursor-pointer bg-accent/5 p-2 rounded overflow-x-auto"
							on:click={() => {
								handleEndpointClick(endpoint);
							}}
						>
							{endpoint.url}
						</li>
					{/each}
				</ul>
				<div class="divider">or</div>
				<label class="label">
					<span class="label-text">graphqlEndpointURL</span>
				</label>
				<input
					type="text"
					placeholder="Type here"
					class="input input-bordered input-sm w-full max-w-xs "
					bind:value={graphqlEndpointURL}
				/>

				<label class="label">
					<span class="label-text">headers</span>
				</label>

				<textarea
					type="textarea"
					cols="40"
					placeholder="header:value"
					class="textarea textarea-bordered textarea-sm overflow-x-auto w-full max-w-xs "
					bind:value={headersValue}
				/>

				<button class="btn bg-primary btn-sm normal-case w-content-min mt-2" on:click={storeAll}
					>update</button
				>
				<button class="btn bg-warning btn-sm normal-case w-content-min mt-14" on:click={deleteAll}
					>delete all</button
				>
			</div>
		</div>
	{/if}

	<div class="fixed bottom-0 right-0 p-2">
		<button class="btn btn-sm " on:click={editButtonClick}>{editText}</button>
	</div>
</main>

<footer />

<style>
</style>
