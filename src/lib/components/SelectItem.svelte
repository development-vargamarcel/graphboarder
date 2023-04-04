<script>
	import QmsWraper from '$lib/components/QMSWraper.svelte';
	import ComponentForLayout from '../../routes/endpoints/[endpointid]/queries/[queryName]/ComponentForLayout.svelte';
</script>

<QmsWraper
	QMSName={endpointInfo.get_qmsNameForObjective(QMS_info, schemaData, 'getMany')}
	initialGqlArgObj={{}}
	QMSType="query"
	tableColsData_StoreInitialValue={[]}
>
	<ComponentForLayout />
</QmsWraper>;

<!-- currentQMS_info={endpointInfo.get_qmsNameForObjective(QMS_info, schemaData, 'getMany')} -->
