<script>
	import { goto } from '$app/navigation';
	import {
		get_rootName,
		get_NamesArray,
		getQM_mandatoryArguments,
		getFields_Grouped
	} from '$lib/utils/usefulFunctions';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import { getQM_Field, getRootType } from '$lib/utils/usefulFunctions';
	import { schemaData } from '$lib/stores/schemaData';
	export let origin;
	export let query;
	console.log('query', query);
	let queryName = query.name;
	let queryNameDisplay = queryName;
	let queryTitleDisplay = '';
	let currentQueryFromRootTypes = query.dd_relatedRoot;
	let { scalarFields, non_scalarFields } = getFields_Grouped(currentQueryFromRootTypes);
	let currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
		return field.name;
	});

	let mandatoryArgs = query?.args?.filter((arg) => {
		return arg.dd_NON_NULL;
	});
	if (mandatoryArgs?.length > 0) {
		queryNameDisplay = `${queryNameDisplay} (${mandatoryArgs.length}) `;
	}

	if (scalarFields.length == 0) {
		queryNameDisplay = queryNameDisplay + ' (...)';
	}
</script>

<a title={queryTitleDisplay} href="{origin}/queries/{queryName}">{queryNameDisplay}</a>
