<script>
	import { clickOutside } from '$lib/actions/clickOutside';
	import { portal } from 'svelte-portal';

	import Page from './Page.svelte';
	import TabContainer from './TabContainer.svelte';
	let forceVisibleSidebar = false;
	export let portalSelector;
	export let links;
</script>

<div
	class="w-[100vh]  h-full {forceVisibleSidebar
		? 'visible '
		: ' invisible'} fixed left-0 top-0 z-50 md:w-[40vh] md:z-0 md:visible md:static  bg-base-200 overflow-y-auto flex"
	use:clickOutside
	on:click={() => {
		forceVisibleSidebar = false;
	}}
	on:click_outside={() => {
		forceVisibleSidebar = false;
	}}
>
	<div>
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
	<div>
		<TabContainer />
	</div>
	<div class="w-[10vw] h-full bg-base-100 " />
</div>
