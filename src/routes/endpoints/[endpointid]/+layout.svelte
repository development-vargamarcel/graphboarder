<script lang="ts">
	import { string_transformer } from '$lib/utils/dataStructureTransformers.js';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	import { page } from '$app/stores';
	$: endpointid = $page.params.endpointid;
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
</script>

<QMSWraper QMSName="endpoints_by_id" initialGqlArgObj={{ id: string_transformer(endpointid) }}>
	<div class="pt-2">
		<EndpointsList QMSName="endpoints_by_id" />
	</div>
</QMSWraper>
<slot><!-- optional fallback --></slot>
