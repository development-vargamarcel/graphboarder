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

<QMSWraper QMSName="endpoints_by_id" initialGqlArgObj={{ id: string_transformer(endpointid) }}>
	<SetEndpointConfigurationToContext QMSName="endpoints_by_id">
		<slot><!-- optional fallback --></slot>
	</SetEndpointConfigurationToContext>
</QMSWraper>
