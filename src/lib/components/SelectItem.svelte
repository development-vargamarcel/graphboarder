<script>
	import QmsWraper from '$lib/components/QMSWraper.svelte';
	import { getContext } from 'svelte';
	import ComponentForLayout from '../../routes/endpoints/[endpointid]/queries/[queryName]/ComponentForLayout.svelte';
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	export let QMS_info;
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
