<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	import { page } from '$app/stores';
	$: endpointid = $page.params.endpointid;
</script>

<div>
	{endpointid}
</div>
<script>
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
</script>

<QMSWraper QMSName="endpoints">
	<div class="pt-2">
		<EndpointsList QMSName="endpoints" />
	</div>
</QMSWraper>
<slot><!-- optional fallback --></slot>
