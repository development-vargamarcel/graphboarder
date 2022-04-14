<script lang="ts">
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';

	import Header from '$lib/header/Header.svelte';
	import '../app.css';
	import { introspectionResult } from '$lib/stores/introspectionResult';

	let gotData = false;
	let introspectionResultUnsubscribe = introspectionResult.subscribe((data) => {
		if (data?.rootTypes.length > 0) {
			gotData = true;
		}
	});

	////////////////////

	import { browser } from '$app/env';
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
		store_auth_token();
		store_graphqlEndpointURL();
	};
	const deleteAll = () => {
		localStorage.removeItem('auth_token');
		localStorage.removeItem('graphqlEndpointURL');
	};
	if (!graphqlEndpointURL) {
		showEdit = true;
	}
</script>

<header />

<main class="bg-base-300 w-full">
	{#if graphqlEndpointURL}
		{#if show_IntrospectionDataGenerator}
			{#if gotData}
				<slot />
			{/if}
			<IntrospectionDataGenerator {graphqlEndpointURL} />
		{/if}
	{/if}
	{#if showEdit}
		<div
			class="fixed bottom-0 bg-base-200 w-screen h-screen overscroll-none overflow-y-auto p-4 mx-auto"
		>
			<div class="form-control w-full max-w-xs mt-40">
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
					<span class="label-text">graphqlEndpointURL</span>
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
		<button
			class="btn btn-sm "
			on:click={() => {
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
			}}>{editText}</button
		>
	</div>
</main>

<footer />

<style>
</style>
