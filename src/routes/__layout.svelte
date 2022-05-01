<script lang="ts">
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';

	import Header from '$lib/header/Header.svelte';
	import '../app.css';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	let testEndpoints = [
		{
			url: 'https://mdunpmb9.directus.app/graphql',
			authToken: 'kdjskhfdkjshfdsfkljdshfkjdhsfk7u4y3f3h8rhef347hh4ueihf8934h'
		},
		{ url: 'https://api.spacex.land/graphql/', authToken: '' },
		{ url: 'https://swapi-graphql.netlify.app/.netlify/functions/index', authToken: '' },
		{ url: 'https://rickandmortyapi.com/graphql', authToken: '' },
		{ url: 'https://beta.pokeapi.co/graphql/v1beta', authToken: '' },
		{ url: 'https://dex-server.herokuapp.com/', authToken: '' },
		{ url: 'https://graphql.anilist.co', authToken: '' }
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

	let auth_token = '';
	let editText = 'edit';
	if (browser && localStorage.getItem('auth_token')) {
		auth_token = localStorage.getItem('auth_token');
	}
	const store_auth_token = () => {
		console.log(auth_token);
		if (auth_token == '') {
			localStorage.removeItem('auth_token');
		} else {
			localStorage.setItem('auth_token', auth_token);
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
		store_auth_token();
		store_graphqlEndpointURL();
		editButtonClick();
	};
	const deleteAll = () => {
		auth_token = '';
		graphqlEndpointURL = '';

		localStorage.removeItem('auth_token');
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
		auth_token = endpoint.authToken;
		graphqlEndpointURL = endpoint.url;
	};
</script>

<header />

<main class="bg-base-300 w-full">
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
				<ul class="space-y-2 max-h-40 overflow-y-auto px-1">
					{#each testEndpoints as endpoint}
						<li
							class="cursor-pointer bg-accent/5 p-2 rounded"
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
					<span class="label-text">auth_token</span>
				</label>
				<input
					type="text"
					placeholder="Type here"
					class="input input-bordered input-sm w-full max-w-xs "
					bind:value={auth_token}
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
