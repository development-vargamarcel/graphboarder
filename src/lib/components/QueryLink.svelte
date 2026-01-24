<script lang="ts">
	import {
		getFields_Grouped,
		get_scalarColsData,
		get_nodeFieldsQMS_info
	} from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';

	interface Props {
		prefix?: string;
		origin: any;
		query: any;
	}

	let { prefix = '', origin, query }: Props = $props();

	import type { QMSMainWraperContext } from '$lib/types/index';

	let QMSMainWraperContext = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	let queryName = $derived(query.name);
	let queryTitleDisplay = '';

	let currentQMS_info = $derived(schemaData.get_QMS_Field(queryName, 'query', schemaData));
	let rowsLocation = $derived($endpointInfo.rowsLocation || []); // Default to empty array if undefined
	let nodeFieldsQMS_info = $derived(get_nodeFieldsQMS_info(currentQMS_info, rowsLocation, schemaData as any));
	let scalarFields = $derived(get_scalarColsData(
		nodeFieldsQMS_info,
		[currentQMS_info.dd_displayName, ...rowsLocation],
		schemaData as any
	));

	let mandatoryArgs = $derived(query?.args?.filter((arg) => {
		return arg.dd_NON_NULL;
	}));
	let ID_Args = $derived(query?.args?.filter((arg) => {
		return arg.dd_rootName == 'ID';
	}));

	let queryNameDisplay = $derived.by(() => {
		let display = queryName;
		if (mandatoryArgs?.length > 0) {
			display = `${display} (${mandatoryArgs.length}) `;
		}
		if (ID_Args?.length > 0) {
			display = `${display} <${ID_Args.length}> `;
		}
		if (scalarFields.length == 0) {
			display = display + ' (no scalar)';
		}
		return display;
	});
</script>

<a title={queryTitleDisplay} href="{origin}/queries/{queryName}" class="block w-full h-full p-2"
	>{queryNameDisplay}</a
>
