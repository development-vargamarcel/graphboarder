<script>
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
</script>

<QMSWraper QMSName="endpoints">
	<div class="pt-2">
		<EndpointsList QMSName="endpoints" />
	</div>
</QMSWraper>
