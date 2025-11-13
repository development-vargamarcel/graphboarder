<script lang="ts">
	import ActiveArgumentsGroupHasFilterOperators from './ActiveArgumentsGroupHasFilterOperators.svelte';
	import { run, preventDefault, stopPropagation } from 'svelte/legacy';

	import SelectModal from './SelectModal.svelte';

	import {
		filterElFromArr,
		formatData,
		getDataGivenStepsOfFields,
		getDeepField,
		getPreciseType,
		getQMSWraperCtxDataGivenControlPanelItem,
		getRootType,
		hasDeepProperty,
		passAllObjectValuesThroughStringTransformerAndReturnNewObject
	} from './../utils/usefulFunctions.ts';
	//!!! chnage bonded to item
	import { flip } from 'svelte/animate';
	import { dndzone, SHADOW_PLACEHOLDER_ITEM_ID } from 'svelte-dnd-action';
	import { getContext, onDestroy, onMount, setContext } from 'svelte';
	import ActiveArgument from '$lib/components/ActiveArgument.svelte';
	import ActiveArgumentsGroup_addFilterAndSortingButtonContent from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButtonContent.svelte';
	import Modal from './Modal.svelte';
	import { nodeAddDefaultFields } from '$lib/utils/usefulFunctions';
	import { stepsOfNodesToStepsOfFields, getUpdatedStepsOfNodes, updateNodeSteps } from '$lib/utils/nodeStepsUtils';
	import { generateGroupDisplayTitle, getNodeDisplayClasses } from '$lib/utils/displayTitleUtils';
	import { getShadowDimensions, updateShadowElement, handleDragStart, handleDragKeyDown, transformDraggedElement as transformDraggedElementUtil, handleDndConsider as handleDndConsiderUtil, handleDndFinalize as handleDndFinalizeUtil, handleDeleteItem } from '$lib/utils/dndUtils';
	import { getRowSelectionState } from '$lib/utils/rowSelectionUtils';
	let stepsOfNodes = $state([]);
	let stepsOfFields = $state([]);
	let stepsOfFieldsFull = $state([]);
	let testName_stepsOFFieldsWasUpdated = $state(false);
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	let getManyQMS = $state();
	///

	let nodeContext_forDynamicData = {};
	if (node.nodeContext_forDynamicData) {
		nodeContext_forDynamicData = node.nodeContext_forDynamicData;
	} else {
		nodeContext_forDynamicData.selectedRowsColValues = writable();
		nodeContext_forDynamicData.selectedRowsColValuesProcessed = writable();

		nodeContext_forDynamicData.rowSelectionState = writable();
		nodeContext_forDynamicData.idColName = writable();
		nodeContext_forDynamicData.selectedQMS = writable();
		nodeContext_forDynamicData.QMSRows = writable();
		nodeContext_forDynamicData.itemColumns = writable();
		nodeContext_forDynamicData.requiredColNames = writable();

		node.nodeContext_forDynamicData = nodeContext_forDynamicData;
	}
	let selectedRowsColValuesAAA = nodeContext_forDynamicData.selectedRowsColValues;
	let selectedRowsColValuesProcessedAAA = nodeContext_forDynamicData.selectedRowsColValuesProcessed;
	let rowSelectionStateAAA = nodeContext_forDynamicData.rowSelectionState;
	let idColNameAAA = nodeContext_forDynamicData.idColName;
	let selectedQMSAAA = nodeContext_forDynamicData.selectedQMS;
	let QMSRowsAAA = nodeContext_forDynamicData.QMSRows;
	let QMSColumnsAAA = nodeContext_forDynamicData.itemColumns;
	let requiredColNamesAAA = nodeContext_forDynamicData.requiredColNames;


	setContext(`${prefix}nodeContext_forDynamicData`, nodeContext_forDynamicData);
	///
	// $: if ($selectedQMSAAA) {
	// 	// console.log(
	// 	// 	{ field, node, nodes },
	// 	// 	nodes[node.id],
	// 	// 	schemaData.get_rootType(null, field.dd_rootName, schemaData)
	// 	// );
	// 	const objToAdd = {
	// 		nodeOrField: node,
	// 		getMany: { selectedQMS: $selectedQMSAAA, rowSelectionState: $rowSelectionStateAAA },
	// 		id: Math.random().toString(36).substr(2, 9)
	// 	};
	// 	console.log({ objToAdd });
	// 	QMSFieldToQMSGetMany_Store.addOrReplaceKeepingOldId(objToAdd);
	// }
	/////start

	let pathIsInCP = false;
	const nodeContext = getContext(`${prefix}nodeContext`);
	if (nodeContext) {
		pathIsInCP = nodeContext?.pathIsInCP;
	}
	let nodeIsInCP = $state(false);
	const CPItemContext = getContext(`${prefix}CPItemContext`);
	if (CPItemContext?.CPItem.nodeId == node.id) {
		setContext(`${prefix}nodeContext`, { pathIsInCP: true });
		nodeIsInCP = true;
	}
	const isCPChild = CPItemContext ? true : false;
	const visibleInCP = pathIsInCP || nodeIsInCP;
	const visible = visibleInCP || !CPItemContext || node.isMain;
	let correctQMSWraperContext = '';
	if (isCPChild) {
		correctQMSWraperContext = getQMSWraperCtxDataGivenControlPanelItem(
			CPItemContext?.CPItem,
			OutermostQMSWraperContext
		);
	} else {
		correctQMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	}
	/////end

	const { finalGqlArgObj_Store, QMS_info, activeArgumentsDataGrouped_Store, QMSType } =
		correctQMSWraperContext;
	const operatorChangeHandler = () => {
		stepsOfNodes = getUpdatedStepsOfNodes(
			JSON.parse(JSON.stringify(parentNode?.stepsOfNodes || [])),
			node
		);
	};
	const dndIsOn = getContext('dndIsOn');
	const showInputField = getContext('showInputField');

	const mutationVersion = getContext('mutationVersion');
	if (QMSType == 'mutation') {
		$mutationVersion = true;
	}

	if (!testName_stepsOFFieldsWasUpdated) {
		stepsOfNodes = getUpdatedStepsOfNodes(
			JSON.parse(JSON.stringify(parentNode?.stepsOfNodes || [])),
			node
		);
		testName_stepsOFFieldsWasUpdated = true;
	}


	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	let dragDisabled = $state(true);
	const flipDurationMs = 500;
	function handleDndConsider(e) {
		//console.log('considering', e, nodes);
		const result = handleDndConsiderUtil(e.detail.items);
		node.items = result.items;
		dragDisabled = result.dragDisabled;
	}
	function handleDndFinalize(e) {
		const result = handleDndFinalizeUtil(e.detail.items, () => {
			nodes = { ...nodes };
			handleChanged();
			onChanged?.();
		});
		node.items = result.items;
		dragDisabled = result.dragDisabled;
	}

	const deleteItem = (e) => {
		node.items = handleDeleteItem(node.items, e.detail.id, () => {
			nodes = { ...nodes };
			handleChanged();
			onChanged?.();
		});
	};
	//
	let labelEl = $state();
	let shadowEl = $state();
	let shadowHeight = $state(20);
	let shadowWidth = $state(20);

	let labelElClone = $state();



	function startDrag(e) {
		// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
		//e.preventDefault();
		dragDisabled = handleDragStart(e);
	}
	function handleKeyDown(e) {
		dragDisabled = handleDragKeyDown(e, dragDisabled);
	}
	const transformDraggedElement = (draggedEl, data, index) => {
		transformDraggedElementUtil(draggedEl);
	};
	//

	const handleChanged = () => {
		finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};

	let argsInfo = $state(QMS_info?.args);
	let showModal = $state(false);

	let groupDisplayTitle = $state('');

	if (node?.addDefaultFields || (node?.isMain && addDefaultFields)) {
		nodeAddDefaultFields(
			node,
			prefix,
			group,
			activeArgumentsDataGrouped_Store,
			schemaData,
			endpointInfo,
			stepsOfFields
		);
	}
	let showSelectModal = $state(false);

	let showAddModal = $state(false);
	let rowSelectionState = {};
	let selectedRowsModel = {};
	import ExplorerTable from '$lib/components/ExplorerTable.svelte';
	import { string_transformer } from '$lib/utils/dataStructureTransformers.ts';
	import { writable } from 'svelte/store';
	import AddNodeToControlPanel from './AddNodeToControlPanel.svelte';
	import GroupDescriptionAndControls from './GroupDescriptionAndControls.svelte';
	import ManyToAllSelectInterfaceDefinition from './ManyToAllSelectInterfaceDefinition.svelte';
	import SelectedRowsDisplay from './SelectedRowsDisplay.svelte';
	interface Props {
		nodes: any;
		parentNodeId: any;
		parentNode?: any;
		node: any;
		availableOperators: any;
		group: any;
		type: any;
		originalNodes: any;
		prefix?: string;
		addDefaultFields: any;
		onChanged?: () => void;
		onUpdateQuery?: () => void;
		onChildrenStartDrag?: () => void;
		onDeleteSubNode?: (detail: { id: string }) => void;
	}

	let {
		nodes = $bindable(),
		parentNodeId,
		parentNode = nodes[parentNodeId],
		node = $bindable(),
		availableOperators,
		group = $bindable(),
		type,
		originalNodes,
		prefix = '',
		addDefaultFields,
		onChanged,
		onUpdateQuery,
		onChildrenStartDrag,
		onDeleteSubNode
	}: Props = $props();

	let selectedRowsColValues = $state([]);

	//------------
	let inputColumnsLocationQMS_Info = $state();
	//!! todo:before getting inputColumnsLocation value,you should check if it is a query or a mutation,and handle it accordingly
	let inputColumnsLocation = $endpointInfo.inputColumnsPossibleLocationsInArg.find((path) => {
		inputColumnsLocationQMS_Info = getDeepField(node, path, schemaData, 'inputFields');
		return inputColumnsLocationQMS_Info;
	});
	//should work
	let idColName = $state();

	//should work
	console.log({ node, inputColumnsLocationQMS_Info, inputColumnsLocation });
	//------------

	let QMSWraperContextForSelectedQMS = {};
	let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
	let forceShowSelectAndAddButtons = false;
	run(() => {
		if ($QMSFieldToQMSGetMany_Store.length > 0) {
			getManyQMS = QMSFieldToQMSGetMany_Store.getObj({
				nodeOrField: node
			})?.getMany?.selectedQMS;
			if (getManyQMS) {
				console.log({ getManyQMS });
			}
		}
	});
	run(() => {
		console.log('nodeContext_forDynamicData.selectedRowsColValues', $selectedRowsColValuesAAA);
	});
	run(() => {
		console.log(
			'nodeContext_forDynamicData.selectedRowsColValuesProcessed',
			$selectedRowsColValuesProcessedAAA
		);
	});
	run(() => {
		console.log('nodeContext_forDynamicData.rowSelectionState', $rowSelectionStateAAA);
	});
	run(() => {
		console.log('nodeContext_forDynamicData.idColName', $idColNameAAA);
	});
	run(() => {
		console.log('nodeContext_forDynamicData.selectedQMS', $selectedQMSAAA);
	});
	run(() => {
		console.log('nodeContext_forDynamicData.QMSRows', $QMSRowsAAA);
	});
	run(() => {
		console.log('nodeContext_forDynamicData.itemColumns', $QMSColumnsAAA);
	});
	run(() => {
		console.log('nodeContext_forDynamicData.requiredColNames', $requiredColNamesAAA);
	});
	run(() => {
		stepsOfFieldsFull = stepsOfNodesToStepsOfFields(stepsOfNodes);
		stepsOfFields = filterElFromArr(stepsOfFieldsFull, ['list', 'bonded']);
		updateNodeSteps(node, stepsOfFieldsFull, stepsOfFields, stepsOfNodes, filterElFromArr);
	});
	run(() => {
		if (labelEl) {
			const dimensions = getShadowDimensions(labelEl);
			shadowHeight = dimensions.height;
			shadowWidth = dimensions.width;
		}
	});
	//$: console.log(shadowEl);
	run(() => {
		if (shadowHeight && shadowEl) {
			labelElClone = updateShadowElement(shadowEl, labelEl, shadowHeight, shadowWidth);
		}
	});
	run(() => {
		groupDisplayTitle = generateGroupDisplayTitle(node, getPreciseType);
	});
	run(() => {
		if (QMSWraperContextForSelectedQMS) {
			idColName = QMSWraperContextForSelectedQMS.idColName;
		}
	});
	run(() => {
		console.log({ QMSWraperContextForSelectedQMS });
	});
</script>

{#if visible}
	{#if showAddModal}
		<Modal
			showApplyBtn={false}
			onCancel={() => {
				showAddModal = false;
			}}
		/>
	{/if}

	{#if showModal}
		<Modal
			showApplyBtn={false}
			onCancel={() => {
				showModal = false;
			}}
		>
			<div class="flex flex-col ">
				<div class="w-full text-lg text-center  mb-2 ">
					<p class="badge badge-info font-bold">
						{groupDisplayTitle}
					</p>
				</div>

				{#if node?.isMain}
					<btn
						class="btn btn-xs btn-info normal-case  mb-6 flex-1"
						onclick={() => {
							nodeAddDefaultFields(
								node,
								prefix,
								group,
								activeArgumentsDataGrouped_Store,
								schemaData,
								endpointInfo,
								stepsOfFields
							);
						}}
					>
						addDefaultFields
					</btn>
				{/if}

				{#if !node?.isMain}
					<div class="flex space-x-4 ">
						{#if parentNode?.inputFields?.some((inputField) => {
							return inputField.dd_displayName == '_not';
						})}
							<div class="form-control mr-1">
								<label class="label cursor-pointer w-min py-0">
									<span class="label-text pr-1">Not</span>
									<input
										type="checkbox"
										class="toggle toggle-sm"
										checked={node.not}
										onchange={stopPropagation(preventDefault(() => {
											if (!node?.isMain) {
												node.not = !node.not;
												operatorChangeHandler();
												handleChanged();
												onChanged?.();
											}
										}))}
									/>
								</label>
							</div>
						{/if}

						<btn
							class="btn btn-xs btn-info  normal-case mb-6 flex-1"
							onclick={() => {
								nodeAddDefaultFields(
									node,
									prefix,
									group,
									activeArgumentsDataGrouped_Store,
									schemaData,
									endpointInfo,
									stepsOfFields
								);
							}}
						>
							addDefaultFields
						</btn>

						<btn
							class="btn btn-xs text-sm mb-1 normal-case flex-1"
							onclick={() => {
								if (node?.operator && !node?.isMain) {
									if (node?.operator == '~spread~') {
										node.operator = 'bonded';
									} else if (node?.operator == 'bonded') {
										node.operator = '~spread~';
									} else {
										node.operator = 'bonded';
									}
								}
								operatorChangeHandler();
								handleChanged();
								onChanged?.();
							}}
						>
							change
						</btn>
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<btn
							class="btn btn-xs btn-warning  mb-6 flex-1"
							onclick={() => {
								alert('not yet implemented');
								console.log(
									'not yet implemented,implement here.Delete node and his items and items of his items recursively until the very end of the tree.'
								);
							}}
						>
							<i class="bi bi-trash-fill"></i>
						</btn>
						{#if !CPItemContext}
							<AddNodeToControlPanel {node} />
						{/if}
					</div>
				{/if}
				<!-- <div class="my-2 flex">
					<div class="card w-full bg-neutral text-neutral-content overflow-x-auto">
						<div class="card-body  pl-0">
							<ManyToAllSelectInterfaceDefinition
								bind:selectedRowsColValues
								{originalNodes}
								{type}
								bind:nodes
								{node}
								{parentNode}
								{parentNodeId}
								{availableOperators}
								{group}
							/>
						</div>
					</div>
				</div> -->
				<div>
					<ActiveArgumentsGroup_addFilterAndSortingButtonContent
						parent_inputFields={parentNode?.inputFields}
						parent_stepsOfFields={stepsOfFields}
						parentNodeId={node.id}
						{onUpdateQuery}
						bind:group
						bind:argsInfo
						{nodes}
						{node}
					/>
				</div>
			</div>
		</Modal>{/if}

	<SelectModal
		onDeleteSubNode={(detail) => {
			deleteItem({ detail });
			//
			//console.log(detail.id, node);
		}}
		bind:selectedQMS={getManyQMS}
		bind:selectedRowsColValues
		bind:showSelectModal
		{originalNodes}
		{onUpdateQuery}
		{type}
		bind:nodes
		{node}
		{parentNode}
		{parentNodeId}
		{onChanged}
		{availableOperators}
		onChildrenStartDrag={startDrag}
		{group}
	/>

	{#if !node?.isMain}
		<div class="   grid   content-center  rounded-full w-min-max w-max">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="flex ">
				{#if $dndIsOn && !nodeIsInCP}
					<div
						tabindex={dragDisabled ? 0 : -1}
						aria-label="drag-handle"
						class="  transition:all duration-500 bi bi-grip-vertical ml-2  -mr-1 text-lg rounded-l-md {node?.operator ==
							undefined || node?.operator == 'bonded'
							? 'text-base-content'
							: node?.operator == '_and'
							? 'text-primary'
							: 'text-secondary'} 
						{node?.not ? ' bg-gradient-to-r== from-base-300/100==' : 'bg-error/0'}
						"
						style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
						onmousedown={(e) => {
							// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
							e.preventDefault();

							onChildrenStartDrag?.();
						}}
						ontouchstart={(e) => {
							// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
							e.preventDefault();

							onChildrenStartDrag?.();
						}}
						onkeydown={handleKeyDown}
						oncontextmenu={stopPropagation(preventDefault(() => {
							//
						}))}
					></div>
				{/if}
				<!-- node?.items?.length <= 1 -->
				{#if node?.operator && !$mutationVersion}
					<div
						tabindex="0"
						class="btn btn-xs btn-ghost px-[1px] text-xs font-light transition-all duration-500  rounded-full  normal-case   {node?.operator ==
							'bonded' || node?.operator == 'list'
							? 'text-base-content'
							: node?.operator == '_and'
							? 'text-primary'
							: 'text-secondary'} break-all h-max  w-max
						{node?.not ? ' bg-gradient-to-r from-secondary/50' : 'bg-error/0'}
						"
						onclick={() => {
							showModal = true;
						}}
						oncontextmenu={stopPropagation(preventDefault(() => {
							//
						}))}
					>
						{groupDisplayTitle}
						<!-- <sub>{stepsOfFields.join('->')}</sub> -->
						{#if node.dd_NON_NULL}
							<sup>
								<i class="text-primary bi bi-asterisk"></i>
							</sup>
						{/if}
					</div>
					{#if nodeIsInCP && node.operator}
						<GroupDescriptionAndControls />
					{/if}
				{/if}
			</div>
		</div>
	{/if}

	<div
		class="  w-min-max w-max transition-all duration-500
	
	
	{node?.operator && (node.items.length > 1 || ($mutationVersion && node.items.length >= 1))
			? 'rounded-l-md bg-gradient-to-rxxx   border-l-[1px] my-1== shadow-sm'
			: ''} 
	{node?.isMain ? '  rounded-l-md bg-gradient-to-rxxx   border-l-[2px] my-1== shadow-sm' : ''}
{node?.operator && node?.not ? 'border-dashed  ' : ''} 
{node?.operator == 'bonded' || node?.operator == 'list'
			? 'border-base-content'
			: node?.operator == '_and'
			? 'border-primary'
			: 'border-secondary '}


"
		oncontextmenu={stopPropagation(preventDefault(() => {
			//
		}))}
		bind:this={labelEl}
		onmousedown={() => {
			dragDisabled = true;
		}}
		ontouchstart={() => {
			dragDisabled = true;
		}}
		onkeydown={() => {
			dragDisabled = true;
		}}
	>
		{#if node?.operator}
			{#if $mutationVersion && !node?.isMain}
				<div class="flex">
					<div
						tabindex="0"
						class="btn btn-xs btn-ghost px-[1px] text-xs font-light transition-all duration-500  rounded-full  normal-case {getManyQMS ||
						$selectedQMSAAA
							? 'text-secondary'
							: ''}   {node?.operator == 'bonded' || node?.operator == 'list'
							? 'text-base-content'
							: node?.operator == '_and'
							? 'text-primary'
							: 'text-secondary'} break-all h-max  w-max
						{node?.not ? ' bg-gradient-to-r from-secondary/50' : 'bg-error/0'}
						"
						onclick={() => {
							showModal = true;
						}}
						oncontextmenu={stopPropagation(preventDefault(() => {
							showSelectModal = !showSelectModal;
						}))}
					>
						{groupDisplayTitle}
						{#if node.dd_NON_NULL}
							<sup>
								<i class="text-primary bi bi-asterisk"></i>
							</sup>
						{/if}
					</div>

					{#if nodeIsInCP && node.operator}
						<GroupDescriptionAndControls />
					{/if}
				</div>
				<!-- {#if inputColumnsLocation && inputColumnsLocationQMS_Info.dd_displayName == node.dd_displayName} -->

				{#if (inputColumnsLocation && inputColumnsLocationQMS_Info.dd_displayName == node.dd_displayName) || forceShowSelectAndAddButtons || getManyQMS}
					<!-- {getManyQMS?.dd_displayName} -->
					<!-- <button
						class="btn btn-xs normal-case"
						on:click={() => {
							showSelectModal = true;
						}}>select</button
					>
					<button
						class="btn btn-xs normal-case"
						on:click={() => {
							showAddModal = true;
						}}>add</button
					> -->
				{/if}

				<SelectedRowsDisplay />
			{/if}
			<div class="flex ">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- node?.items?.length > 1 || node?.isMain -->

				{#if node?.isMain}
					<div
						tabindex="0"
						class="btn btn-xs btn-ghost px-[1px] text-xs font-light transition-all duration-500  rounded-full  normal-case   {node?.operator ==
							'bonded' || node?.operator == 'list'
							? 'text-base-content'
							: node?.operator == '_and'
							? 'text-primary'
							: 'text-secondary'} break-all h-max  w-max"
						onclick={() => {
							showModal = true;
						}}
					>
						{groupDisplayTitle}
						{#if node.dd_NON_NULL}
							<sup>
								<i class="text-primary bi bi-asterisk"></i>
							</sup>
						{/if}
					</div>
				{/if}
				<p class="grow"></p>
			</div>
		{:else}
			<div class="pr-2 rounded-box  w-full">
				<div class=" transition-color duration-500 rounded-box ringxxx  ring-1xxx    ">
					<ActiveArgument
						bind:selectedRowsColValues
						bind:showSelectModal
						{onUpdateQuery}
						bind:nodes
						{onChanged}
						onChildrenStartDrag={startDrag}
						{parentNode}
						{node}
						onContextmenuUsed={() => {
							if (!node?.isMain) {
								node.not = !node.not;
								handleChanged();
								onChanged?.();
							}
						}}
						isNot={node.not}
						onInUseChanged={() => {}}
						activeArgumentData={node}
						{group}
					/>
				</div>
			</div>
		{/if}

		{#if node.hasOwnProperty('items')}
			<section
				class=" duration-500 {$dndIsOn
					? '  min-h-[30px] min-w-[200px]'
					: 'pl-1'} rounded-l-none  {node?.isMain && !isCPChild
					? ' border-l-2 border-l-transparent  min-h-[40vh] md:min-h-[60vh] '
					: ' '}
				 w-full"
				use:dndzone={{
					items: node.items,
					dragDisabled,
					flipDurationMs,
					transformDraggedElement,
					centreDraggedOnCursor: true,
					type: node?.dd_rootName || 'default'
				}}
				onconsider={handleDndConsider}
				onfinalize={handleDndFinalize}
			>
				<!-- WE FILTER THE SHADOW PLACEHOLDER THAT WAS ADDED IN VERSION 0.7.4, filtering this way rather than checking whether 'nodes' have the id became possible in version 0.9.1 -->
				{#if node.items.length > 1 || node?.isMain || true}
					{#each node.items.filter((item) => {
						return item.id !== SHADOW_PLACEHOLDER_ITEM_ID;
					}) as item (item.id)}
						<div
							animate:flip={{ duration: flipDurationMs }}
							class="    border-2== max-w-min  {$mutationVersion && 'mt-2'} "
						>
							<div class="flex dnd-item">
								{#if testName_stepsOFFieldsWasUpdated}
									{#key stepsOfFields}
										<ActiveArgumentsGroupHasFilterOperators
											onDeleteSubNode={(detail) => {
												deleteItem({ detail });
												//
												//console.log(detail.id, node);
											}}
											{originalNodes}
											{onUpdateQuery}
											{type}
											bind:nodes
											node={nodes[item.id]}
											parentNode={node}
											parentNodeId={node.id}
											{onChanged}
											{availableOperators}
											onChildrenStartDrag={startDrag}
											{group}
										/>
									{/key}
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</section>
		{/if}
	</div>
	{#if node.id == SHADOW_PLACEHOLDER_ITEM_ID}
		<div class=" ml-8 h-0     top-0 left-0 visible" id="shadowEl" bind:this={shadowEl}></div>
	{/if}
{/if}
