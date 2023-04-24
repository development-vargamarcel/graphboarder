<script>
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import { string_transformer } from '$lib/utils/dataStructureTransformers';
</script>

<QMSWraper
	QMSName="endpoints"
	tableColsData_StoreInitialValue={[
		{ title: 'provider name', stepsOfFields: ['endpoints', 'configuration', 'id'] },
		{ title: 'provider id', stepsOfFields: ['endpoints', 'configuration', 'id'] },
		{ title: 'configuration', stepsOfFields: ['endpoints', 'configuration', 'configuration'] }
	]}
>
	<div class="pt-2">
		<EndpointsList QMSName="endpoints" />
	</div>
</QMSWraper>
