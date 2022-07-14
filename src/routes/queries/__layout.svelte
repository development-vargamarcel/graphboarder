<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	let queries = $introspectionResult.queryFields;
	import { getStores, navigating, page, session, updated } from '$app/stores';
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

<SidebarAndMainArea title={$page.params.queryName}>
	<div slot="sidebar">
		<ul class="menu p-2 ">
			{#each queries as query}
				<li>
					{#if $schemaData.queryFields.length > 0}
						<QueryLink {query} {origin} />
					{/if}
				</li>
			{/each}
		</ul>
	</div>
	<div slot="main">
		{#key $page.params.queryName}
			<slot />
		{/key}
	</div>
</SidebarAndMainArea>
