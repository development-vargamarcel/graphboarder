<script lang="ts">
	import {
		getFields_Grouped,
		get_scalarColsData,
		get_nodeFieldsQMS_info
	} from '$lib/utils/usefulFunctions';
	import { getContext, untrack } from 'svelte';
	import type { QMSMainWraperContext } from '$lib/types/index';
	import { get } from 'svelte/store';

	interface Props {
		prefix?: string;
		origin: any;
		query: any;
	}

	let { prefix = '', origin, query }: Props = $props();

	const initialPrefix = untrack(() => prefix);
	// Initialization after props
	let context = getContext<QMSMainWraperContext>(`${initialPrefix}QMSMainWraperContext`);
	const endpointInfo = context?.endpointInfo;
	const schemaData = context?.schemaData;
	let queryName = $derived(query.name);
	let queryNameDisplay = $state(untrack(() => queryName));
	let queryTitleDisplay = '';
	//let { scalarFields, non_scalarFields } = getFields_Grouped(currentQueryFromRootTypes);
	let currentQMS_info = $derived(
		(get(schemaData) as any).get_QMS_Field(queryName, 'query', get(schemaData))
	);
	let rowsLocation = $derived(
		endpointInfo.get_rowsLocation(currentQMS_info, get(schemaData) as any)
	);
	let nodeFieldsQMS_info = $derived(
		get_nodeFieldsQMS_info(currentQMS_info, rowsLocation, get(schemaData) as any)
	);
	let scalarFields = $derived(
		get_scalarColsData(
			nodeFieldsQMS_info,
			[currentQMS_info.dd_displayName, ...rowsLocation],
			get(schemaData) as any
		)
	);

	let mandatoryArgs = $derived(
		query?.args?.filter((arg) => {
			return arg.dd_NON_NULL;
		})
	);
	let ID_Args = $derived(
		query?.args?.filter((arg) => {
			return arg.dd_rootName == 'ID';
		})
	);

	$effect(() => {
		let name = queryName;
		if (mandatoryArgs?.length > 0) {
			name = `${name} (${mandatoryArgs.length}) `;
		}
		if (ID_Args?.length > 0) {
			name = `${name} <${ID_Args.length}> `;
		}
		if (scalarFields.length == 0) {
			name = name + ' (no scalar)';
		}
		queryNameDisplay = name;
	});
</script>

<a title={queryTitleDisplay} href="{origin}/queries/{queryName}" class="block w-full h-full p-2"
	>{queryNameDisplay}</a
>
