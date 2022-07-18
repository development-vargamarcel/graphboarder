<script>
	import { clickOutside } from '$lib/actions/clickOutside';
	import { portal } from 'svelte-portal';

	import Page from './Page.svelte';
	import TabContainer from './TabContainer.svelte';
	export let forceVisibleSidebar = false;
	export let portalSelector;
	export let links;
	import { introspectionResult } from '$lib/stores/introspectionResult';
	let queries = $introspectionResult.queryFields;
	import { schemaData } from '$lib/stores/schemaData';
	import QueryLink from './QueryLink.svelte';
	import { getStores, navigating, page, session, updated } from '$app/stores';

	let origin = $page.url.origin;
	$: console.log({ forceVisibleSidebar });
</script>

<div
	class="w-full h-screen  {forceVisibleSidebar
		? 'visible '
		: ' invisible'} fixed left-0  z-50  md:z-0 md:visible md:static    flex"
	use:clickOutside
	on:click={() => {
		if (forceVisibleSidebar) {
			forceVisibleSidebar = false;
		}
	}}
	on:click_outside={() => {
		if (forceVisibleSidebar) {
			forceVisibleSidebar = false;
		}
	}}
>
	<div class="h-screen">
		<TabContainer />
	</div>
	<ul class="space-y-2 h-screen overflow-y-auto   overflow-x-auto  bg-base-100 grow">
		{#each queries as query}
			<li class="rounded hover:bg-info/50  m-2 break-all">
				{#if $schemaData.queryFields.length > 0}
					<QueryLink {query} {origin} />
				{/if}
			</li>
		{/each}
	</ul>
</div>
