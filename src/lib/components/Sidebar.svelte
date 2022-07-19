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
	import { fade, fly } from 'svelte/transition';

	let origin = $page.url.origin;
	$: console.log({ forceVisibleSidebar });
</script>

<div
	class="w-full h-screen  {forceVisibleSidebar
		? 'visible '
		: ' invisible'} fixed left-0  z-50  md:z-0 md:visible md:static flex"
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
	<div class="invisible md:visible">
		<TabContainer />
	</div>
</div>
{#if forceVisibleSidebar}
	<div
		class=" bg-black/30 fixed top-0 z-50 md:hidden h-screen w-screen"
		in:fade={{ duration: 600, opacity: 1 }}
		out:fade={{ duration: 300, opacity: 1 }}
	/>
	<div
		class="md:hidden fixed top-0 z-50"
		in:fly={{ x: -300, duration: 600, opacity: 1 }}
		out:fly={{ x: -350, duration: 300, opacity: 1 }}
	>
		<TabContainer />
	</div>
{/if}
