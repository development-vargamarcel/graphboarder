<script>
	import QmsWraper from '$lib/components/QMSWraper.svelte';
	import { getContext } from 'svelte';
	import ComponentForLayout from '../../routes/endpoints/[endpointid]/queries/[queryName]/ComponentForLayout.svelte';
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	export let QMS_info;
	export let enableMultiRowSelectionState = true;
	export let rowSelectionState;
	export let QMSWraperContext = {};
</script>

{#key QMS_info}
	{#if QMS_info}
		<QmsWraper
			bind:QMSWraperContext
			QMSName={QMS_info.dd_displayName}
			initialGqlArgObj={{}}
			QMSType="query"
			tableColsData_StoreInitialValue={[]}
		>
			<ComponentForLayout
				on:rowClicked
				on:rowSelectionChange
				{rowSelectionState}
				{enableMultiRowSelectionState}
			/>
		</QmsWraper>{/if}
{/key}

<!-- currentQMS_info={endpointInfo.get_qmsNameForObjective(QMS_info, schemaData, 'getMany')} -->
