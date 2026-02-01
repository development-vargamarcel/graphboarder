<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import Page from '$lib/components/Page.svelte';

	let { title, sidebar, main } = $props();

	let forceVisibleSidebar = $state(false);
</script>

<div class="flex w-full">
	<div
		role="button"
		tabindex="0"
		class="w-[30vh] h-[100vh] {forceVisibleSidebar
			? 'visible '
			: ' invisible'} fixed left-0 top-0 z-50 lg:z-0 lg:visible lg:static bg-base-200 overflow-y-auto"
		use:clickOutside
		onclick={() => {
			forceVisibleSidebar = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				forceVisibleSidebar = false;
			}
		}}
		{...{
			onclick_outside: () => {
				forceVisibleSidebar = false;
			}
		}}
	>
		{@render sidebar?.()}
	</div>

	<Page MenuItem={true}>
		<div class="w-full navbar bg-base-300">
			<div class="flex-none lg:hidden">
				<button
					class="btn btn-square btn-ghost"
					aria-label="Toggle Sidebar"
					onclick={() => {
						forceVisibleSidebar = !forceVisibleSidebar;
					}}
				>
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
				</button>
			</div>
			<div class="flex-1 px-2 mx-2">{title}</div>
			<div class="flex-none block">
				<ul class="flex">
					<li>
						<button class="btn btn-sm" aria-label="Add"
							><i class="bi bi-plus-square text-xl"></i>
						</button>
					</li>
				</ul>
			</div>
		</div>
		{@render main?.()}
	</Page>
</div>
