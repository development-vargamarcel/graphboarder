<script lang="ts">

	import QmsWraper from '$lib/components/QMSWraper.svelte';
	import { getContext } from 'svelte';
	import ComponentForLayout from '../../routes/endpoints/[endpointid]/queries/[queryName]/ComponentForLayout.svelte';
	import { Logger } from '$lib/utils/logger';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	interface Props {
		prefix?: string;
		QMS_info: any;
		enableMultiRowSelectionState?: boolean;
		rowSelectionState: any;
		QMSWraperContext?: any;
		node: any;
		onRowSelectionChange?: (detail: any) => void;
		onRowClicked?: (detail: any) => void;
	}

	let {
		prefix = '',
		QMS_info,
		enableMultiRowSelectionState = true,
		rowSelectionState,
		QMSWraperContext = $bindable({}),
		node,
		onRowSelectionChange,
		onRowClicked
	}: Props = $props();
	Logger.debug('nooooddeeee', { node });
	let getManyQMS = $state();
	$effect(() => {
		if ($QMSFieldToQMSGetMany_Store.length > 0) {
			getManyQMS = QMSFieldToQMSGetMany_Store.getObj({
				nodeOrField: node
			})?.getMany?.selectedQMS;
			if (getManyQMS) {
				Logger.debug({ getManyQMS });
			}
		}
	});
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
				{rowSelectionState}
				{enableMultiRowSelectionState}
				{onRowSelectionChange}
				{onRowClicked}
			/>
		</QmsWraper>{/if}
{/key}

<!-- currentQMS_info={endpointInfo.get_qmsNameForObjective(QMS_info, schemaData, 'getMany')} -->
