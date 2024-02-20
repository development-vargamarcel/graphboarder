<script>
	import { getContext } from 'svelte';
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
	const getNodeGivenControlPanelItem = (
		CPItem,
		mergedChildren_controlPanel_Value,
		mergedChildren_QMSWraperCtxData_Value
	) => {
		const activeArgumentsDataGrouped_Store = mergedChildren_QMSWraperCtxData_Value.find(
			(currCtx) => {
				return currCtx.stepsOfFields.join() == CPItem.stepsOfFieldsThisAppliesTo.join();
			}
		).activeArgumentsDataGrouped_Store;

		const node = get(activeArgumentsDataGrouped_Store)[0].group_argsNode[CPItem.nodeId];
		return { ...node, CPItem };
	};
	$: controlPanelNodes = $mergedChildren_controlPanel_Store.map((CPItem) => {
		return getNodeGivenControlPanelItem(
			CPItem,
			$mergedChildren_controlPanel_Store,
			$mergedChildren_QMSWraperCtxData_Store
		);
	});
	$: console.log('from control panel', { controlPanelNodes });
	let showModal = false;
</script>

<!-- <AddColumn
	bind:column_stepsOfFields
	{addColumnFromInput}
	{dd_relatedRoot}
	{QMSName}
	QMS_info={currentQMS_info}
	on:newColumnAddRequest
/> -->
{$mergedChildren_controlPanel_Store.length}
<div class="card w-full ">
	<div class="card-body  m-2">
		<!-- {#each $mergedChildren_controlPanel_Store as item}
			{item.id}
		{:else}
			No starred elements detected.
		{/each} -->
		{#key controlPanelNodes}
			{#if controlPanelNodes.length > 0 || true}
				<button
					class="btn btn-xs btn-ghost normal-case  rounded px-2  "
					on:click|stopPropagation={() => {
						showModal = true;
					}}
				>
					<icon class=" bi bi-star" />

					<QMSWraper
						QMSName={type.dd_displayName}
						QMSType="query"
						QMS_info={{ ...type, args: controlPanelNodes }}
					>
						{#if showModal}
							<Modal
								modalIdetifier={'activeArgumentsDataModal'}
								showApplyBtn={false}
								on:cancel={(e) => {
									let { detail } = e;
									if (detail.modalIdetifier == 'activeArgumentsDataModal') {
										showModal = false;
									}
								}}
								><div class="  w-full  ">
									<div class="mx-auto mt-2  w-full   space-y-2   pb-2  ">
										<div class="w-2" />

										<ActiveArguments />

										<div class="w-2" />
									</div>
								</div>
							</Modal>
						{/if}
					</QMSWraper>
				</button>
			{/if}
		{/key}
	</div>
</div>
