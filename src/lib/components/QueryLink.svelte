<script>
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;

	const schemaData = QMSMainWraperContext?.schemaData;
	import {
		getFields_Grouped,
		get_scalarColsData,
		get_nodeFieldsQMS_info
	} from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';

	export let origin;
	export let query;
	let queryName = query.name;
	let queryNameDisplay = queryName;
	let queryTitleDisplay = '';
	//let { scalarFields, non_scalarFields } = getFields_Grouped(currentQueryFromRootTypes);
	let currentQMS_info = schemaData.get_QMS_Field(queryName, 'query', schemaData);
	const rowsLocation = $endpointInfo.rowsLocation;
	const nodeFieldsQMS_info = get_nodeFieldsQMS_info(currentQMS_info, rowsLocation, schemaData);
	let scalarFields = get_scalarColsData(
		nodeFieldsQMS_info,
		[currentQMS_info.dd_displayName, ...rowsLocation],
		schemaData
	);

	let mandatoryArgs = query?.args?.filter((arg) => {
		return arg.dd_NON_NULL;
	});
	let ID_Args = query?.args?.filter((arg) => {
		return arg.dd_rootName == 'ID';
	});
	if (mandatoryArgs?.length > 0) {
		queryNameDisplay = `${queryNameDisplay} (${mandatoryArgs.length}) `;
	}
	if (ID_Args?.length > 0) {
		queryNameDisplay = `${queryNameDisplay} <${ID_Args.length}> `;
	}
	if (scalarFields.length == 0) {
		queryNameDisplay = queryNameDisplay + ' (no scalar)';
	}
</script>

<a title={queryTitleDisplay} href="{origin}/queries/{queryName}" class="block w-full h-full p-2"
	>{queryNameDisplay}</a
>
