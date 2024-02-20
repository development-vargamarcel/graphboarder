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
	export let type;
	export let prefix = '';
	export let column_stepsOfFields;
	export let addColumnFromInput;
	export let dd_relatedRoot;
	export let QMSName;
	export let currentQMS_info;
	const QMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	const {
		mergedChildren_QMSWraperCtxData_Store,
		mergedChildren_controlPanel_Store,
		mergedChildren_finalGqlArgObj_Store
	} = QMSWraperContext;
	console.log(
		'from control panel',
		QMSWraperContext,
		$mergedChildren_controlPanel_Store,
		$mergedChildren_finalGqlArgObj_Store
	);
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
		{#each $mergedChildren_controlPanel_Store as item}
			{item.id}
		{:else}
			No starred elements detected.
		{/each}
		{#if false}
			<div class="dropdown grow ">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<label tabindex="0" class="btn btn-xs bi bi-list-nested text-lg p-1  w-min" />
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<div
					tabindex="0"
					class="dropdown-content menu p-2  bg-base-100 rounded-box ==w-max max-w-screen text-sm shadow-2xl z-[9999] "
				>
					<div
						class="max-h-[70vh] sm:max-h-[80vh] md:max-h-[80vh] overflow-auto overscroll-contain max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
					>
						<!-- <Type template="columnAddDisplay" isOnMainList={true} {type} /> -->
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
