<script>
	import { clickOutside } from '$lib/actions/clickOutside';

	import TabContainer from '$lib/components/TabContainer.svelte';
	import { getContext } from 'svelte';
	export let forceVisibleSidebar = false;
	export let portalSelector;
	export let links;
	import { fade, fly } from 'svelte/transition';
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;

	$: console.log({ forceVisibleSidebar });
</script>

<!-- on:click_outside={() => {
		if (forceVisibleSidebar) {
			forceVisibleSidebar = false;
		}
	}} -->

<div
	class="w-full h-screen  {forceVisibleSidebar
		? 'visible '
		: ' invisible'} fixed left-0  z-50  md:z-0 md:visible md:static flex  "
	use:clickOutside
	on:click={() => {
		if (forceVisibleSidebar) {
			forceVisibleSidebar = false;
		}
	}}
>
	<div class="invisible md:visible">
		<TabContainer {endpointInfo} />
	</div>
</div>
{#if forceVisibleSidebar}
	<div
		class=" bg-base-100/50 fixed top-0 z-50 md:hidden h-screen w-screen"
		in:fade|global={{ duration: 300, opacity: 1 }}
		out:fade|global={{ duration: 300, opacity: 1 }}
	/>
	<div
		class="md:hidden fixed top-0 z-50"
		in:fly|global={{ x: -300, duration: 300, opacity: 1 }}
		out:fly|global={{ x: -350, duration: 300, opacity: 1 }}
	>
		<TabContainer
			{endpointInfo}
			on:hideSidebar={() => {
				if (forceVisibleSidebar) {
					forceVisibleSidebar = false;
				}
			}}
		/>
	</div>
{/if}
