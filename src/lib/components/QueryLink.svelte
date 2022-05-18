<script>
	import { goto } from '$app/navigation';
	import {
		get_mainName,
		get_NamesArray,
		getQM_mandatoryArguments,
		getFields_Grouped
	} from '$lib/utils/usefulFunctions';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import { getQM_Field, getRootType } from '$lib/utils/usefulFunctions';
	export let origin;
	export let query;
	let queryName = query.name;
	let queryNameDisplay = queryName;
	let queryTitleDisplay = '';
	let currentQueryInfo = getQM_Field($introspectionResult.queryFields, queryName);
	let currentQueryNameForType = get_mainName(get_NamesArray(currentQueryInfo));
	let currentQueryFromRootTypes = getRootType(
		$introspectionResult.rootTypes,
		currentQueryNameForType
	);

	let { scalarFields, non_scalarFields } = getFields_Grouped(currentQueryFromRootTypes);
	let currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
		return field.name;
	});

	let mandatoryArgs = getQM_mandatoryArguments(query);
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

<a title={queryTitleDisplay} href="{origin}/queries/{queryName}">{queryNameDisplay}</a>
<!-- 
		on:mousedown={() => {
		goto(`${origin}/queries/`);
	}}
	on:click={() => {
		goto(`${origin}/queries/${queryName}`);
	}} -->
