<script lang="ts">
	import { get } from 'svelte/store';
	import ActiveArgumentsGroupWraper from './ActiveArgumentsGroupWraper.svelte';
	import { getContext, setContext } from 'svelte';
	import { getQMSWraperCtxDataGivenControlPanelItem } from '$lib/utils/usefulFunctions';
	interface Props {
		prefix?: string;
		CPItem: any;
	}

	let { prefix = '', CPItem }: Props = $props();
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);

	const QMSWraperCtx = getQMSWraperCtxDataGivenControlPanelItem(CPItem, OutermostQMSWraperContext);
	const activeArgumentsDataGrouped_Store = QMSWraperCtx.activeArgumentsDataGrouped_Store;

	const CPItemContext = { CPItem, QMSWraperCtx };
	setContext(`${prefix}CPItemContext`, CPItemContext);
</script>

<div class="card w-full bg-base-100 text-base-content">
	<div class="card-body p-2">
		<ActiveArgumentsGroupWraper
			on:updateQuery={() => {}}
			update_activeArgumentsDataGrouped={() => {}}
			group={$activeArgumentsDataGrouped_Store[0]}
			argsInfo={QMSWraperCtx.QMS_info?.args}
			activeArgumentsDataGrouped={$activeArgumentsDataGrouped_Store}
		/>
	</div>
</div>
