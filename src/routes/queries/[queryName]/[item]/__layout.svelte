<script context="module">
	export const router = true;
</script>

<script>
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';

	import { urqlClient } from '$lib/stores/urqlClient';
	import { onDestroy, onMount } from 'svelte';

	setClient($urqlClient);
	let item = $page.params.item;
	console.log({ item });
	onMount(() => {
		document.getElementById('my-drawer-4').checked = true;
	});
	onDestroy(() => {
		document.getElementById('my-drawer-4').checked = false;
	});
</script>

<div class="  bg-base-100 w-full ">
	<div class="flex space-x-2 sticky top-0 bg-base-100 shadow-md p-2">
		<div class="flex-none w-14 h-14 ...">
			<label
				for="my-drawer-4"
				class="drawer-button btn btn-primary w-min rounded-full"
				on:click={() => {
					history.back();
				}}>X</label
			>
		</div>
		<div class="grow h-14 ..." />
		<div class="flex-none w-14 h-14 ...">
			<div class="btn btn-success mb-40">ok</div>
		</div>
	</div>
	<div class="px-2 mt-4 pb-40">content here</div>
</div>
