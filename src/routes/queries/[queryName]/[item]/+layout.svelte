<script context="module">
	export const router = true;
</script>

<script>
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';

	import { urqlClient } from '$lib/utils/urqlClient';
	import { onDestroy, onMount } from 'svelte';
	import Page from '$lib/components/Page.svelte';

	setClient($urqlClient);
	let item = $page.params.item;
	//console.log({ item });
</script>

<Page MenuItem={false} CustomId={item} backPath={`/queries/${$page.params.queryName}`}>
	<div class="p-2">
		{item}
	</div>
</Page>
