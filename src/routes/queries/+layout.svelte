<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import { getStores, navigating, page, updated } from '$app/stores';
	import QueryLink from '$lib/components/QueryLink.svelte';

	import { onDestroy } from 'svelte';
	import { schemaData } from '$lib/stores/schemaData';
	import SidebarAndMainArea from '$lib/components/SidebarAndMainArea.svelte';
	//console.log('queries: ', queries);

	let origin = $page.url.origin;
	let pathname;

	let pageUnsubscribe = page.subscribe((value) => {
		pathname = value.url.pathname;
		//console.log('value===', value);
	});
	onDestroy(() => {
		pageUnsubscribe();
	});
</script>

<div class="w-full pt-2">
	{#key $page.params.queryName}
		<slot />
	{/key}
</div>
