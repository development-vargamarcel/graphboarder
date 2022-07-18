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
</script>

<div
	class="w-full h-screen  {forceVisibleSidebar
		? 'visible '
		: ' invisible'} fixed left-0  z-50  md:z-0 md:visible md:static  bg-base-100  flex"
	use:clickOutside
	on:click={() => {
		forceVisibleSidebar = false;
	}}
	on:click_outside={() => {
		forceVisibleSidebar = false;
	}}
>
	<div class="h-screen">
		<TabContainer />
	</div>
	<div>
		<ul class="space-y-2 h-screen overflow-y-auto  w-screen md:w-max overflow-x-auto ">
			{#each queries as query}
				<li class="rounded hover:bg-info/50  p-2 ">
					{#if $schemaData.queryFields.length > 0}
						<QueryLink {query} {origin} />
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>
