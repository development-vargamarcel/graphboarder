<script lang="ts">
	import { string_transformer } from '$lib/utils/dataStructureTransformers.js';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	import { page } from '$app/stores';
	let endpointConfiguration;
	let endpointid;
	$: {
		endpointid = $page.params.endpointid;
		if (endpointid) {
			if (endpointid.startsWith('localEndpoint--')) {
				endpointConfiguration = localEndpoints.find(
					(endpoint) => endpoint.id == endpointid.split('--')[1]
				);
			}
			if (endpointid.startsWith('localstorageEndpoint--')) {
				const localStorageEndpoints = stringToJs(localStorage.getItem('endpoints') || null);
				if (localStorageEndpoints?.length > 0) {
					endpointConfiguration = localStorageEndpoints.find(
						(endpoint) => endpoint.id == endpointid.split('--')[1]
					);
				}
			}
		}
	}
	$: console.log({ endpointid });
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import SetEndpointConfigurationToContext from '$lib/components/SetEndpointConfigurationToContext.svelte';
	import MainWraper from '$lib/components/MainWraper.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { localEndpoints } from '$lib/stores/testData/testEndpoints';
	import { stringToJs } from '$lib/utils/usefulFunctions';

	let forceVisibleSidebar = false;
</script>

{#if endpointid}
	{#if (endpointid.startsWith('localEndpoint--') || endpointid.startsWith('localstorageEndpoint--')) && endpointConfiguration}
		<MainWraper endpointInfoProvided={endpointConfiguration}>
			<main class="bg-base-300  flex w-[100vw] overflow-hidden">
				<div class="  md:max-w-[300px]">
					<Sidebar bind:forceVisibleSidebar />
				</div>
				<div class="flex flex-col w-full md:w-[65vw]   grow h-screen">
					<div class=" bg-base-100 min-h-[50px] flex">
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
					<slot />
				</div>
			</main>
		</MainWraper>
	{:else}
		<QMSWraper
			isOutermostQMSWraper={true}
			QMSName="endpoints_by_pk"
			initialGqlArgObj={{ id: string_transformer(endpointid) }}
			tableColsData_StoreInitialValue={[
				{ title: 'configTemplate', stepsOfFields: ['endpoints', 'configuration', 'configuration'] }
			]}
		>
			<SetEndpointConfigurationToContext QMSName="endpoints_by_pk">
				<slot><!-- optional fallback --></slot>
			</SetEndpointConfigurationToContext>
		</QMSWraper>
	{/if}{/if}
