<script>
	import Type from '$lib/components/Type.svelte';
	import Description from './Description.svelte';

	import { writable } from 'svelte/store';
	import AutoInterface from '$lib/components/fields/AutoInterface.svelte';
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	export let setNotInUseIfNotValid = true;
	export let setNotInUseIfNotValidAndENUM = true;
	export let parentNode;
	export let node;
	export let prefix = '';
	import Toggle from '$lib/components/fields/Toggle.svelte';
	import { clickOutside } from '$lib/actions/clickOutside';
	import Modal from './Modal.svelte';
	import { string_transformerREVERSE } from '$lib/utils/dataStructureTransformers';
	import {
		argumentCanRunQuery,
		formatData,
		getPreciseType,
		getRootType
	} from '$lib/utils/usefulFunctions';
	import AddNodeToControlPanel from './AddNodeToControlPanel.svelte';
	import GroupDescriptionAndControls from './GroupDescriptionAndControls.svelte';
	import SelectModal from './SelectModal.svelte';
	import ExplorerTable from './ExplorerTable.svelte';
	import SelectedRowsDisplay from './SelectedRowsDisplay.svelte';
	const { activeArgumentsDataGrouped_Store } = getContext(`${prefix}QMSWraperContext`);
	const { finalGqlArgObj_Store } = getContext(`${prefix}QMSWraperContext`);
	export let isNot;
	let dispatch = createEventDispatcher();
	export let activeArgumentData;
	export let group;
	export let activeArgumentsDataGrouped;
	//
	export let nodes;
	export let originalNodes;
	export let type;
	export let parentNodeId;
	export let availableOperators;
	export let startDrag;
	let idColNameOfSelectedRow;
	//
	setContext(
		'choosenDisplayInterface',
		writable(activeArgumentData.chosenDisplayInterface || activeArgumentData.dd_displayInterface)
	);
	let showDescription = false;
	let labelEl;
	let shadowEl;
	let shadowHeight = 20;
	let shadowWidth = 20;

	let labelElClone;

	$: if (labelEl) {
		shadowHeight = labelEl.clientHeight;
		shadowWidth = labelEl.clientWidth;
	}

	//$: console.log(shadowEl);
	$: if (shadowHeight && shadowEl) {
		if (shadowEl.style.height == 0) {
			shadowEl.style.height = `${shadowHeight + 18}px`;
			shadowEl.style.width = `${shadowWidth}px`;

			labelElClone = labelEl.cloneNode(true);
			labelElClone.classList.remove('dnd-item');
			labelElClone.classList.add('border-2', 'border-accent');

			shadowEl.appendChild(labelElClone);
		}
	}
	console.log({ activeArgumentData });
	let get_valueToDisplay = () => {
		let value;
		if (getPreciseType(activeArgumentData.chd_dispatchValue) == 'number') {
			value = activeArgumentData.chd_dispatchValue;
		}
		if (activeArgumentData.dd_displayInterface == 'ENUM') {
			let chd_dispatchValue = activeArgumentData.chd_dispatchValue;
			value = chd_dispatchValue?.length > 0 ? chd_dispatchValue : undefined;
		} else {
			if (Array.isArray(activeArgumentData.chd_dispatchValue)) {
				value = activeArgumentData.chd_dispatchValue.join(', ');
			} else if (typeof activeArgumentData.chd_dispatchValue == 'string') {
				value = string_transformerREVERSE(
					activeArgumentData.chd_dispatchValue || activeArgumentData.defaultValue
				);
			}
		}

		if (activeArgumentData.chd_dispatchValue && activeArgumentData.dd_displayInterface == 'geo') {
			value = '[map]';
		}

		return value;
	};
	const CPItemContext = getContext(`${prefix}CPItemContext`);
	const CPItem = CPItemContext?.CPItem;
	let expandedVersion;
	let valueToDisplay = undefined;
	$: {
		if (true || activeArgumentData?.inUse) {
			valueToDisplay = get_valueToDisplay();
		}
		// if (valueToDisplay !== undefined ) {
		if (!CPItemContext) {
			expandedVersion = false;
		} else {
			expandedVersion = true;
		}
	}
	const outermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { mergedChildren_QMSWraperCtxData_Store } = outermostQMSWraperContext;

	const handleChanged = (detail) => {
		console.log('detail', detail);
		Object.assign(activeArgumentData, detail);

		const isValid = argumentCanRunQuery(activeArgumentData);
		const isInUse = activeArgumentData.inUse;
		const isENUM = activeArgumentData.dd_displayInterface == 'ENUM';
		console.log({ isValid });
		if (!isInUse && isValid) {
			inUse_set(true);
		} else if (setNotInUseIfNotValidAndENUM && isInUse && isENUM && !isValid) {
			inUse_set(false);
		} else if (setNotInUseIfNotValid && isInUse && !isValid) {
			inUse_set(false);
		}
		dispatch('changed', detail);
		console.log('activeArgumentsDataGrouped_Store', $activeArgumentsDataGrouped_Store);
		updateActiveArgument();
		//finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};
	const handleClickOutside = () => {
		//
		//console.log('clicked outside');
		//expandedVersion = false; //!!! this is causing the expanded version to disappear when you click outside of it,but sometimes,is not desirable like when another modal with choises opens up and if you click on anything that upper modal disappears.
	};

	const updateActiveArgument = () => {
		if (!CPItemContext) {
			activeArgumentsDataGrouped_Store.update_activeArgument(activeArgumentData, group.group_name);
			finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
		}
		//update the activeArgumentsDataGrouped_StoreForCPItem and related
		if (CPItem) {
			const QMSWraperCtxData_StoreForCPItem = $mergedChildren_QMSWraperCtxData_Store.find(
				(currCtx) => {
					return currCtx.stepsOfFields.join() == CPItem.stepsOfFieldsThisAppliesTo.join();
				}
			);
			const activeArgumentsDataGrouped_StoreForCPItem =
				QMSWraperCtxData_StoreForCPItem.activeArgumentsDataGrouped_Store;
			activeArgumentsDataGrouped_StoreForCPItem.update_activeArgument(
				activeArgumentData,
				group.group_name
			);
			QMSWraperCtxData_StoreForCPItem.finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj(); //!!!is not enough to rerun query it seems
		}
	};
	const inUse_set = (inUse) => {
		activeArgumentData.inUse = inUse;
		updateActiveArgument();

		dispatch('inUseChanged');
		//finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};
	const inUse_toggle = () => {
		inUse_set(!activeArgumentData.inUse);
	};
	let showModal = false;
	const mutationVersion = getContext('mutationVersion');
	const showInputField = getContext('showInputField');

	let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	const nodeRootType = getRootType(null, activeArgumentData.dd_rootName, schemaData);
	let showSelectModal = false;
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);

	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	let selectedQMS;
	$: if ($QMSFieldToQMSGetMany_Store.length > 0) {
		selectedQMS = QMSFieldToQMSGetMany_Store.getObj({
			nodeOrField: node
		})?.getMany?.selectedQMS;
	}
	const nodeContext_forDynamicData = getContext(`${prefix}nodeContext_forDynamicData`);
	let selectedRowsColValues = nodeContext_forDynamicData.selectedRowsColValues;
</script>

<SelectModal
	on:deleteSubNode={(e) => {
		deleteItem(e);
		//
		//console.log(e.detail.id, node);
	}}
	bind:showSelectModal
	on:updateQuery
	bind:nodes
	on:changed
	on:childrenStartDrag={startDrag}
	{originalNodes}
	{type}
	{node}
	{parentNode}
	{parentNodeId}
	{availableOperators}
	{group}
/>
{#if showModal}
	<Modal
		showApplyBtn={false}
		on:cancel={() => {
			showModal = false;
		}}
	>
		<div class="flex flex-col">
			<div class="w-full text-lg text-center mb-2">
				<p class="badge badge-info font-bold">
					<!-- {#if group.group_name == 'root'}
						{activeArgumentData.stepsOfFields?.join(' > ')}
					{:else}
						{activeArgumentData.stepsOfFields?.slice(1)?.join(' > ')}
					{/if} -->
					{activeArgumentData.stepsOfFields[activeArgumentData.stepsOfFields.length - 1]}
				</p>
			</div>

			<div class="mb-6 flex space-x-4">
				{#if parentNode?.inputFields?.some((inputField) => {
					return inputField.dd_displayName == '_not';
				})}
					<div class="form-control">
						<label class="label cursor-pointer w-min py-0">
							<span class="label-text pr-1">Not</span>
							<input
								type="checkbox"
								class="toggle toggle-sm"
								bind:checked={isNot}
								on:change={() => {
									dispatch('contextmenuUsed');
								}}
							/>
						</label>
					</div>
				{/if}

				<div class="form-control mr-1">
					<label class="label cursor-pointer w-min py-0">
						<span class="label-text pr-1">active</span>
						<input
							type="checkbox"
							class="toggle toggle-xs"
							checked={activeArgumentData?.inUse}
							on:change|self|stopPropagation|capture={inUse_toggle}
						/>
					</label>
				</div>
				<btn
					class="btn btn-xs btn-warning flex-1"
					on:click={() => {
						activeArgumentsDataGrouped_Store.delete_activeArgument(
							activeArgumentData,
							group.group_name
						);
						finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
					}}
				>
					<i class="bi bi-trash-fill" />
				</btn>
				{#if !CPItemContext}
					<AddNodeToControlPanel {node} />
				{/if}
				{#if CPItemContext}
					<GroupDescriptionAndControls />
				{/if}
			</div>

			<div class="px-2">
				<AutoInterface
					alwaysOn_interfacePicker
					typeInfo={activeArgumentData}
					on:changed={(e) => {
						handleChanged(e.detail);
					}}
				/>
			</div>
			<Description QMSInfo={activeArgumentData} />
			<div class="mt-2 w-full overflow-x-auto">
				<Type
					index={0}
					type={activeArgumentData}
					template="default"
					depth={0}
					on:colAddRequest={(e) => {
						//console.log(e);
					}}
				/>
			</div>
		</div>
	</Modal>{/if}

<!-- svelte-ignore a11y-label-has-associated-control -->
<label
	use:clickOutside
	on:click_outside={handleClickOutside}
	class="   rounded-box {group.group_isRoot ? ' min-w-fit w-min' : 'w-min-fit '}  {!expandedVersion
		? ' pr-1 '
		: ' '} 
	{expandedVersion ? ' pr-2 ' : ' '}
	{$mutationVersion ? ' pr-2 pb-2 ' : ' '} 
		{!expandedVersion && !$mutationVersion ? ' md:max-w-[25vw]' : ' '} 
		 my-1 flex dnd-item
		 {activeArgumentData?.inUse && !$mutationVersion
		? activeArgumentData.canRunQuery
			? 'ring ring-[1px]  bg-base-200/75 ring-primary/25 '
			: 'ring ring-[1px]  ring-primary/100 bg-error/50'
		: 'bg-base-200/50'} 
		{$mutationVersion ? 'p-1 min-w-[80vw] md:min-w-[50vw]' : 'pr-[1px]'}
		"
	bind:this={labelEl}
>
	<div class="grow">
		<div class="  flex {$mutationVersion ? 'flex-col' : ''}  space-x-0">
			<input
				type="checkbox"
				class="checkbox input-primary hidden"
				on:change|self={() => {
					//leave this here,will prevent the click to go trough
				}}
			/>
			<div
				class="   text-xs select-none flex grow flex-nowrap
											"
			>
				<button
					class=" {activeArgumentData.inUse
						? activeArgumentData.canRunQuery
							? 'outline outline-1  outline-success/30 '
							: 'outline outline-2 outline-error'
						: ' '} 
						{activeArgumentData.inUse ? 'font-semibold' : 'font-normal outline-0'}
						{$mutationVersion ? 'mb-1 ml-1' : ''}
						
						btn-ghost text-base-content btn btn-xs text-xs normal-case rounded-box pl-1 py-0 h-full min-h-min
						{isNot ? ' bg-gradient-to-r from-secondary/30 outline-dashed' : 'bg-error/0'} {selectedQMS
						? 'text-secondary'
						: ''}"
					on:click={() => {
						showModal = true;
					}}
					on:contextmenu|preventDefault|stopPropagation|self={() => {
						showSelectModal = !showSelectModal;
						expandedVersion = !expandedVersion;
					}}
				>
					<!-- {#if group.group_name == 'root'}
						{activeArgumentData.stepsOfFields?.join(' > ') + ':'}
					{:else}
						{activeArgumentData.stepsOfFields?.slice(1)?.join(' > ') + ':'}
					{/if} -->
					{activeArgumentData.stepsOfFields[activeArgumentData.stepsOfFields.length - 1]}
					{#if activeArgumentData.dd_NON_NULL}
						<sup>
							<i class="text-primary bi bi-asterisk" />
						</sup>
					{/if}
					<!-- {#if selectedRowsColValuesProcessed}
						: {Object.values(selectedRowsColValuesProcessed[0])[0]}
					{/if} -->
				</button>

				<div
					class="flex flex-nowrap overflow-x-auto max-w-[65vw]
								"
				>
					{#if !expandedVersion && !$mutationVersion && !$showInputField}
						<p
							class="shrink-0 text-base-content text-xs font-light pt-[1px] mx-2"
							on:click|preventDefault|stopPropagation|self={() => {
								expandedVersion = true;
							}}
						>
							{valueToDisplay}
						</p>
					{/if}
				</div>
			</div>
			{#if expandedVersion || $mutationVersion || $showInputField}
				{#if $selectedRowsColValues?.length > 0}
					<SelectedRowsDisplay />
				{:else}
					<div class="pl-1">
						<AutoInterface
							typeInfo={activeArgumentData}
							on:changed={(e) => {
								handleChanged(e.detail);
							}}
						/>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</label>

{#if activeArgumentData[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
	<div class=" ml-8 h-0 absolute w-11/12 top-0 left-0 visible" id="shadowEl" bind:this={shadowEl} />
{/if}
