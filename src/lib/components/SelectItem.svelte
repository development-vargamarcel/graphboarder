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
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	export let node;
	console.log('nooooddeeee', { node });
	let getManyQMS;
	$: if ($QMSFieldToQMSGetMany_Store.length > 0) {
		getManyQMS = QMSFieldToQMSGetMany_Store.getObj({
			nodeOrField: node
		})?.getMany?.selectedQMS;
		if (getManyQMS) {
			console.log({ getManyQMS });
		}
	}
</script>

{#key getManyQMS}
	{#if getManyQMS}
		<QmsWraper
			bind:QMSWraperContext
			QMSName={getManyQMS.dd_displayName}
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
