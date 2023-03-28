<script>
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import { string_transformer } from '$lib/utils/dataStructureTransformers';
</script>

<QMSWraper
	QMSName="endpoints"
	initialGqlArgObj={{ sort: [string_transformer('configTemplate.provider.name')] }}
	tableColsData_StoreInitialValue={[
		{ title: 'provider name', stepsOfFields: ['endpoints', 'configTemplate', 'provider', 'name'] },
		{ title: 'provider id', stepsOfFields: ['endpoints', 'configTemplate', 'configuration'] }
	]}
>
	<div class="pt-2">
		<EndpointsList QMSName="endpoints" />
	</div>
</QMSWraper>
