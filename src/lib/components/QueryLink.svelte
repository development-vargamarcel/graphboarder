<script>
	import { goto } from '$app/navigation';
	import { mandatoryArguments } from '$lib/utils/usefulFunctions';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import {
		getQueryInfo,
		getCurrentQueryNameForType,
		getQueryFromRootTypes,
		getScalarFieldsNames
	} from '$lib/utils/usefulFunctions';
	export let origin;
	export let query;
	//let queryName = query?.type?.ofType?.name || query?.type?.name || query?.name;
	let queryName = query.name;
	let queryNameDisplay = queryName;
	let queryTitleDisplay = '';
	let currentQueryInfo = getQueryInfo($introspectionResult.queryFields, queryName);
	let currentQueryNameForType = getCurrentQueryNameForType(currentQueryInfo);
	let currentQueryFromRootTypes = getQueryFromRootTypes(
		$introspectionResult.rootTypes,
		currentQueryNameForType
	);
	let currentQuery_fields_SCALAR_names = getScalarFieldsNames(currentQueryFromRootTypes);
	let mandatoryArgs = mandatoryArguments(query);
	if (mandatoryArgs) {
		queryTitleDisplay = `${queryTitleDisplay} ${JSON.stringify(mandatoryArgs)} \n`;
		queryNameDisplay = `${queryNameDisplay} !(${mandatoryArgs.length}) `;
	}

	if (currentQuery_fields_SCALAR_names.length == 0) {
		queryNameDisplay = queryNameDisplay + ' (...)';
		queryTitleDisplay = `${queryTitleDisplay} \n ${JSON.stringify(
			currentQueryFromRootTypes?.fields
		)} `;
	}
</script>

<a
	title={queryTitleDisplay}
	href="{origin}/queries/{queryName}"
	on:mousedown={() => {
		goto(`${origin}/queries/`);
	}}
	on:click={() => {
		goto(`${origin}/queries/${queryName}`, { replaceState: true });
	}}>{queryNameDisplay}</a
>
