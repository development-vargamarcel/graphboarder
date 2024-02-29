<script>
	import { get } from 'svelte/store';
	import ActiveArgumentsGroupWraper from './ActiveArgumentsGroupWraper.svelte';
	import { getContext, setContext } from 'svelte';
	export let prefix = '';
	export let CPItem;
	const QMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const {
		mergedChildren_QMSWraperCtxData_Store,
		mergedChildren_controlPanel_Store,
		mergedChildren_finalGqlArgObj_Store
	} = QMSWraperContext;

	const getQMSWraperCtxDataGivenControlPanelItem = (
		CPItem,
		mergedChildren_controlPanel_Value,
		mergedChildren_QMSWraperCtxData_Value
	) => {
		const QMSWraperCtxData = mergedChildren_QMSWraperCtxData_Value.find((currCtx) => {
			return currCtx.stepsOfFields.join() == CPItem.stepsOfFieldsThisAppliesTo.join();
		});
		return QMSWraperCtxData;
	};

	const activeArgumentsDataGrouped_StoreCurr = getQMSWraperCtxDataGivenControlPanelItem(
		CPItem,
		$mergedChildren_controlPanel_Store,
		$mergedChildren_QMSWraperCtxData_Store
	).activeArgumentsDataGrouped_Store;

	const QMSWraperCtxValCurr = getQMSWraperCtxDataGivenControlPanelItem(
		CPItem,
		$mergedChildren_controlPanel_Store,
		$mergedChildren_QMSWraperCtxData_Store
	);
	const CPItemContext = { CPItem };
	setContext(`${prefix}CPItemContext`, CPItemContext);
</script>

<div class="card w-full bg-base-100 text-base-content">
	<div class="card-body pb-0">
		<ActiveArgumentsGroupWraper
			on:updateQuery={() => {}}
			update_activeArgumentsDataGrouped={() => {}}
			group={$activeArgumentsDataGrouped_StoreCurr[0]}
			argsInfo={QMSWraperCtxValCurr.QMS_info?.args}
			activeArgumentsDataGrouped={$activeArgumentsDataGrouped_StoreCurr}
		/>
	</div>
</div>
