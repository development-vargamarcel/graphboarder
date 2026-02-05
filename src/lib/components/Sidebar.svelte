<script lang="ts">
	import TabContainer from '$lib/components/TabContainer.svelte';
	import { getContext, untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Logger } from '$lib/utils/logger';
	import type { QMSMainWraperContext } from '$lib/types/index';

	interface Props {
		forceVisibleSidebar?: boolean;
		portalSelector?: any;
		links?: any;
		prefix?: string;
	}

	let {
		forceVisibleSidebar = $bindable(false),
		portalSelector = undefined,
		links = undefined,
		prefix = ''
	}: Props = $props();

	// Initialization after props
	let context = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	let endpointInfo = $derived(context?.endpointInfo);

	$effect(() => {
		Logger.debug({ forceVisibleSidebar });
	});
</script>

<!-- on:click_outside={() => {
		if (forceVisibleSidebar) {
			forceVisibleSidebar = false;
		}
	}} -->

<div
	role="button"
	tabindex="0"
	class="w-full h-screen {forceVisibleSidebar
		? 'visible '
		: ' invisible'} fixed left-0 z-50 md:z-0 md:visible md:static flex"
	onclick={() => {
		if (forceVisibleSidebar) {
			forceVisibleSidebar = false;
		}
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			if (forceVisibleSidebar) {
				forceVisibleSidebar = false;
			}
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
		in:fade|global={{ duration: 300 }}
		out:fade|global={{ duration: 300 }}
	></div>
	<div
		class="md:hidden fixed top-0 z-50"
		in:fly|global={{ x: -300, duration: 300, opacity: 1 }}
		out:fly|global={{ x: -350, duration: 300, opacity: 1 }}
	>
		<TabContainer
			{endpointInfo}
			onHideSidebar={() => {
				if (forceVisibleSidebar) {
					forceVisibleSidebar = false;
				}
			}}
		/>
	</div>
{/if}
