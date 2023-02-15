<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	import { page } from '$app/stores';
	$: endpointid = $page.params.endpointid;
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
</script>

<div>
	{endpointid}
</div>

<QMSWraper QMSName="endpoints_by_id">
	<div class="pt-2">
		<EndpointsList QMSName="endpoints_by_id" />
	</div>
</QMSWraper>
<slot><!-- optional fallback --></slot>
