<script>
	import { clickOutside } from '$lib/actions/clickOutside';

	import Page from './Page.svelte';
	let forceVisibleSidebar = false;
	export let title;
</script>

<div class="flex w-full">
	<div
		class="w-[40vh]  h-[100vh]  {forceVisibleSidebar
			? 'visible '
			: ' invisible'} fixed left-0 top-0 z-50 lg:z-0 lg:visible lg:static bg-base-300 overflow-y-auto"
		use:clickOutside
		on:click={() => {
			forceVisibleSidebar = false;
		}}
		on:click_outside={() => {
			forceVisibleSidebar = false;
		}}
	>
		<slot name="sidebar" />
	</div>

	<Page MenuItem={true}>
		<div class="w-full navbar bg-base-300">
			<div class="flex-none lg:hidden">
				<label
					for="my-drawer-3"
					class="btn btn-square btn-ghost"
					on:click={() => {
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
				</label>
			</div>
			<div class="flex-1 px-2 mx-2">{title}</div>
			<div class="flex-none hidden lg:block">
				<ul class="flex">
					<li>
						<button class="btn btn-sm "><i class="bi bi-plus-square-fill text-xl " /> </button>
					</li>
				</ul>
			</div>
		</div>
		<slot name="main" />
	</Page>
</div>
