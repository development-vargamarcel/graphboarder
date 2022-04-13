<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import { goto } from '$app/navigation';
	let queries = $introspectionResult.queryFields;
	console.log(queries);
	import { getStores, navigating, page, session, updated } from '$app/stores';
	let origin = $page.url.origin;
	console.log($page);
	console.log(origin);
</script>

<div class="drawer  drawer-mobile ">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col ">
		<!-- Navbar -->
		<div class="w-full navbar bg-base-300">
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
			<div class="flex-1 px-2 mx-2"><a href="/queries">back to queries</a></div>
		</div>
		<slot />
	</div>
	<div class="drawer-side ">
		<label for="my-drawer-3" class="drawer-overlay" />
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<ul class="menu p-4 overflow-y-auto w-80 bg-base-100">
			{#each queries as query}
				<!-- svelte-ignore a11y-missing-attribute -->
				<label for="my-drawer-3" class=""
					><li>
						<a
							href="{origin}/queries/{query.name}"
							on:mousedown={() => {
								goto(`${origin}/queries/`);
							}}
							on:click={() => {
								goto(`${origin}/queries/${query.name}`, { replaceState: true });
							}}>{query.name}</a
						>
					</li></label
				>
			{/each}
		</ul>
	</div>
</div>
