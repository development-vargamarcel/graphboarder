<script>
	import { getContext, setContext } from 'svelte';
	import { get } from 'svelte/store';
	import ActiveArgumentsGroupWraper from './ActiveArgumentsGroupWraper.svelte';

	export let type;
	export let prefix = '';
	export let column_stepsOfFields;
	export let addColumnFromInput;
	export let dd_relatedRoot;
	export let QMSName;
	export let currentQMS_info;
	const QMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { mergedChildren_QMSWraperCtxData_Store, mergedChildren_controlPanel_Store } =
		QMSWraperContext;

	const getQMSWraperCtxDataGivenControlPanelItem = (
		CPItem,
		mergedChildren_QMSWraperCtxData_Value
	) => {
		const QMSWraperCtxData = mergedChildren_QMSWraperCtxData_Value.find((currCtx) => {
			return currCtx.stepsOfFields.join() == CPItem.stepsOfFieldsThisAppliesTo.join();
		});
		return QMSWraperCtxData;
	};
	let showControlPanel = false;
	const controlPanelContext = {};
	setContext(`${prefix}controlPanelContext`, controlPanelContext);
</script>

<button
	class="btn btn-xs w-full"
	on:click={() => {
		showControlPanel = !showControlPanel;
	}}
>
	toggle control panel
</button>
{#if showControlPanel}
	{#each $mergedChildren_controlPanel_Store as CPItem}
		{@const activeArgumentsDataGrouped_StoreValCurr = get(
			getQMSWraperCtxDataGivenControlPanelItem(
				CPItem,
				$mergedChildren_controlPanel_Store,
				$mergedChildren_QMSWraperCtxData_Store
			).activeArgumentsDataGrouped_Store
		)}
		{@const QMSWraperCtxValCurr = getQMSWraperCtxDataGivenControlPanelItem(
			CPItem,
			$mergedChildren_controlPanel_Store,
			$mergedChildren_QMSWraperCtxData_Store
		)}
		<ActiveArgumentsGroupWraper
			on:updateQuery={() => {}}
			update_activeArgumentsDataGrouped={() => {}}
			group={activeArgumentsDataGrouped_StoreValCurr[0]}
			argsInfo={QMSWraperCtxValCurr.QMS_info?.args}
			{activeArgumentsDataGrouped_StoreValCurr}
		/>{/each}
{/if}
