<script lang="ts">
	import { run } from 'svelte/legacy';

	import { clickOutside } from '$lib/actions/clickOutside';

	import TabContainer from '$lib/components/TabContainer.svelte';
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	interface Props {
		forceVisibleSidebar?: boolean;
		portalSelector: any;
		links: any;
		prefix?: string;
	}

	let {
		forceVisibleSidebar = $bindable(false),
		portalSelector,
		links,
		prefix = ''
	}: Props = $props();
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;

	run(() => {
		console.log({ forceVisibleSidebar });
	});
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
	onclick={() => {
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
	></div>
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
