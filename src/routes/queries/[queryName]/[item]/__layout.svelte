<script context="module">
	export const router = true;
</script>

<script>
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';

	import { urqlClient } from '$lib/stores/urqlClient';
	import { onDestroy, onMount } from 'svelte';
	import Page from '$lib/components/Page.svelte';

	setClient($urqlClient);
	let item = $page.params.item;
	console.log({ item });
</script>

<Page MenuItem={false} CustomId={item}>dsds</Page>
