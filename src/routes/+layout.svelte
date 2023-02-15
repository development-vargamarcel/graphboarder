<script lang="ts">
	import EndpointPicker from '$lib/components/endpointPicker.svelte';
	import '../app.postcss';
	import { endpointInfo } from '$lib/stores/endpointHandling/endpointInfo';
	const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	console.log('qqq', QMSMainWraperContext);
	import { getContext, setContext } from 'svelte';
	import MainWraper from '$lib/components/MainWraper.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	setContext('endpointInfo', endpointInfo);
	let forceVisibleSidebar = false;
	import { testEndpoints_Store } from '$lib/stores/testData/testEndpoints';
	//endpointInfo.smartSet($testEndpoints_Store[1]);
</script>

<header />

<EndpointPicker testEndpoints={$testEndpoints_Store}>
	{#key $endpointInfo?.url}
		{#if $endpointInfo?.url}
			<MainWraper>
				<main class="bg-base-300  flex w-[100vw] overflow-hidden">
					<div class="  md:max-w-[300px]">
						<Sidebar bind:forceVisibleSidebar />
					</div>
					<div class="flex flex-col w-full md:w-[65vw]   grow h-screen">
						<div class=" bg-base-100 min-h-[50px] flex">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<label
								class="btn btn-square btn-ghost  md:hidden"
								on:click={() => {
									forceVisibleSidebar = true;
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									class="inline-block w-6 h-6 stroke-current "
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 6h16M4 12h16M4 18h16"
									/></svg
								>
							</label>
							<div />
						</div>
						{#if $endpointInfo}
							<slot />
						{/if}
					</div>
				</main>
			</MainWraper>
		{/if}
	{/key}
</EndpointPicker>
<footer />

<style>
</style>
