<script lang="ts">
	import QmsWraper from '$lib/components/QMSWraper.svelte';
	import { getContext, untrack } from 'svelte';
	import ComponentForLayout from '../../routes/endpoints/[endpointid]/queries/[queryName]/ComponentForLayout.svelte';
	import { Logger } from '$lib/utils/logger';

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

	import type {
		QMSMainWraperContext,
		QMSWraperContext as QMSWraperContextType
	} from '$lib/types/index';
	let mainWraperCtx = getContext<QMSMainWraperContext>(
		`${untrack(() => prefix)}QMSMainWraperContext`
	);
	const endpointInfo = mainWraperCtx?.endpointInfo;
	const schemaData = mainWraperCtx?.schemaData;
	const OutermostQMSWraperContext = getContext<QMSWraperContextType>(
		`${untrack(() => prefix)}OutermostQMSWraperContext`
	);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	$effect(() => {
		Logger.debug('nooooddeeee', { node });
	});

	let getManyQMS = $derived.by(() => {
		if ($QMSFieldToQMSGetMany_Store.length > 0) {
			return QMSFieldToQMSGetMany_Store.getObj({
				nodeOrField: node
			})?.getMany?.selectedQMS;
		}
		return undefined;
	});

	$effect(() => {
		if (getManyQMS) {
			Logger.debug({ getManyQMS });
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
				QMSName={getManyQMS.dd_displayName}
				{rowSelectionState}
				{enableMultiRowSelectionState}
				{onRowSelectionChange}
				{onRowClicked}
			/>
		</QmsWraper>{/if}
{/key}

<!-- currentQMS_info={endpointInfo.get_qmsNameForObjective(QMS_info, schemaData, 'getMany')} -->
