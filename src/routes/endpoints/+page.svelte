<script>
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QmsWraper from '$lib/components/QMSWraper.svelte';
</script>

<QmsWraper prefix="endpointsList" QMSName="endpoints">
	<div class="pt-2">
		<EndpointsList QMSName="endpoints" />
	</div>
</QmsWraper>
