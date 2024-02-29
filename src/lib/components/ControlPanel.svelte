<script>
	import { getContext, setContext } from 'svelte';
	import AddColumn from './AddColumn.svelte';
	///not good
	//1.Select type using Type or AddColumn
	//2.Create QMSWraperCtx if not existent
	//3.Select node from QMSWraperCtx.ActiveArgumentsDataGrouped_Store (show list of nodes Object.values(nodes) <show stepsOfFields>)
	//4.Add a way to create nested nodes fast,just by needidng to choose
	///

	///
	//1.stepsOfFieldsThisAppliesTo will go into activeArgumentsContext
	//1.5 every node must have knowledge of the steps of fields to the filters trough a activeArgumentsContext
	//
	//2.Select node from QMSWraperCtx.ActiveArgumentsDataGrouped_Store (show list of nodes Object.values(nodes) <show stepsOfFields>)
	///
	import Type from './Type.svelte';
	import Modal from './Modal.svelte';
	import ActiveArguments from './ActiveArguments.svelte';
	import QMSWraper from './QMSWraper.svelte';
	import { get } from 'svelte/store';
	import ActiveArgumentsGroupHasFilterOperators from './ActiveArgumentsGroupHasFilterOperators.svelte';
	import { each } from 'svelte/internal';
	import ActiveArgumentsGroupWraper from './ActiveArgumentsGroupWraper.svelte';

	export let type;
	export let prefix = '';
	export let column_stepsOfFields;
	export let addColumnFromInput;
	export let dd_relatedRoot;
	export let QMSName;
	export let currentQMS_info;
	const QMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const {
		mergedChildren_QMSWraperCtxData_Store,
		mergedChildren_controlPanel_Store,
		mergedChildren_finalGqlArgObj_Store
	} = QMSWraperContext;
	$: {
		console.log(
			'from control panel',
			QMSWraperContext,
			$mergedChildren_controlPanel_Store,
			$mergedChildren_QMSWraperCtxData_Store
		);
	}

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

	let showControlPanel = false;
	const controlPanelContext = {};
	setContext(`${prefix}controlPanelContext`, controlPanelContext);
</script>

<!-- <AddColumn
	bind:column_stepsOfFields
	{addColumnFromInput}
	{dd_relatedRoot}
	{QMSName}
	QMS_info={currentQMS_info}
	on:newColumnAddRequest
/> -->
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
