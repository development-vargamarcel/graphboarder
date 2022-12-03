<script>
	import { endpointInfo } from '$lib/stores/endpointInfo/endpointInfo';
	import { schemaData } from '$lib/stores/schemaData';
	import {
		getFields_Grouped,
		get_scalarColsData,
		get_nodeFieldsQMS_Info
	} from '$lib/utils/usefulFunctions';

	export let origin;
	export let query;
	let queryName = query.name;
	let queryNameDisplay = queryName;
	let queryTitleDisplay = '';
	let currentQueryFromRootTypes = query.dd_relatedRoot;
	//let { scalarFields, non_scalarFields } = getFields_Grouped(currentQueryFromRootTypes);
	let currentQMS_Info = schemaData.get_QMS_Field(queryName, 'query');
	const rowsLocation = $endpointInfo.rowsLocation;
	const nodeFieldsQMS_Info = get_nodeFieldsQMS_Info(currentQMS_Info, rowsLocation);
	let scalarFields = get_scalarColsData(nodeFieldsQMS_Info, [
		currentQMS_Info.dd_displayName,
		...rowsLocation
	]);

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
