<script lang="ts">
	import { string_transformer } from '$lib/utils/dataStructureTransformers.js';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	import { page } from '$app/stores';
	$: endpointid = $page.params.endpointid;
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import SetEndpointConfigurationToContext from '$lib/components/SetEndpointConfigurationToContext.svelte';
</script>

{#if endpointid.startsWith('-local-')}
	<!-- content here -->
{:else}
	<QMSWraper
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
{/if}
