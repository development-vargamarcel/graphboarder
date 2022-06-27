<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	let queries = $introspectionResult.queryFields;
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import QueryLink from '$lib/components/QueryLink.svelte';

	import { onDestroy } from 'svelte';
	import { schemaData } from '$lib/stores/schemaData';
	console.log('queries: ', queries);

	let origin = $page.url.origin;
	let pathname;

	let pageUnsubscribe = page.subscribe((value) => {
		pathname = value.url.pathname;
		console.log('value===', value);
	});
	onDestroy(() => {
		pageUnsubscribe();
	});
</script>

<div class="drawer  drawer-mobile  h-screen overflow-hidden">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content  flex flex-col  w-full  ">
		<!-- Navbar -->
		<div class="w-full  bg-base-300 flex ">
			<div class="flex-none lg:hidden">
				<label for="my-drawer-3" class="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block w-6 h-6 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/></svg
					>
				</label>
			</div>
			<div class="flex-1 pt-3 px-2 mx-2 space-x-2">
				<a href="/">go home</a><a href="/queries">go to queries</a>
			</div>
		</div>
		<!-- overflow-auto h-full -->
		<div class="w-full h-[89vh]">
			{#key pathname}
				<slot />
			{/key}
		</div>
	</div>
	<div class="drawer-side ">
		<label for="my-drawer-3" class="drawer-overlay" />
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<ul class="menu p-4 overflow-y-auto w-80 bg-base-100">
			{#each queries as query}
				<!-- svelte-ignore a11y-missing-attribute -->
				<label for="my-drawer-3" class=""
					><li>
						{#if $schemaData.queryFields.length > 0}
							<QueryLink {query} {origin} />
						{/if}
					</li></label
				>
			{/each}
		</ul>
	</div>
</div>
