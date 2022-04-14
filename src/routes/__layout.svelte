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
			<div class="flex mx-auto  w-max p-4  space-x-2 overflow-auto w-1/2 ">
				<input class="input input-sm w-40" type="text" bind:value={graphqlEndpointURL} />
				<button class="btn btn-sm normal-case w-content-min" on:click={store_graphqlEndpointURL}
					>change <br /> graphqlEndpointURL</button
				>
			</div>
			<div class="flex mx-auto  w-max p-4  space-x-2 overflow-auto w-full ">
				<input
					type="text"
					class="input input-sm w-40"
					placeholder="jwt token"
					bind:value={auth_token}
				/>

				<button class="btn bg-primary btn-sm normal-case w-content-min" on:click={store_auth_token}
					>change <br /> auth_token</button
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
