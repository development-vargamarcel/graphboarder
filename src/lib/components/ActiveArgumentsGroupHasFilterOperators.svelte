<script>
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
	import { createEventDispatcher, getContext, onDestroy, onMount, setContext } from 'svelte';
	import ActiveArgument from '$lib/components/ActiveArgument.svelte';
	import ActiveArgumentsGroup_addFilterAndSortingButtonContent from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButtonContent.svelte';
	import Modal from './Modal.svelte';
	import { nodeAddDefaultFields } from '$lib/utils/usefulFunctions';
	const dispatch = createEventDispatcher();
	export let nodes;
	export let parentNodeId;
	export let parentNode = nodes[parentNodeId];
	export let node;
	export let availableOperators;
	export let group;
	export let type;
	export let originalNodes;
	let stepsOfNodes = [];
	let stepsOfFields = [];
	let stepsOfFieldsFull = [];
	let testName_stepsOFFieldsWasUpdated = false;
	export let prefix = '';
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	let getManyQMS;
	$: if ($QMSFieldToQMSGetMany_Store.length > 0) {
		getManyQMS = QMSFieldToQMSGetMany_Store.getObj({
			nodeOrField: node
		})?.getMany?.selectedQMS;
		if (getManyQMS) {
			console.log({ getManyQMS });
		}
	}
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

	$: console.log('nodeContext_forDynamicData.selectedRowsColValues', $selectedRowsColValuesAAA);
	$: console.log(
		'nodeContext_forDynamicData.selectedRowsColValuesProcessed',
		$selectedRowsColValuesProcessedAAA
	);
	$: console.log('nodeContext_forDynamicData.rowSelectionState', $rowSelectionStateAAA);
	$: console.log('nodeContext_forDynamicData.idColName', $idColNameAAA);
	$: console.log('nodeContext_forDynamicData.selectedQMS', $selectedQMSAAA);
	$: console.log('nodeContext_forDynamicData.QMSRows', $QMSRowsAAA);
	$: console.log('nodeContext_forDynamicData.itemColumns', $QMSColumnsAAA);
	$: console.log('nodeContext_forDynamicData.requiredColNames', $requiredColNamesAAA);

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
	let nodeIsInCP = false;
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
			JSON.parse(JSON.stringify(parentNode?.stepsOfNodes || []))
		);
	};
	const dndIsOn = getContext('dndIsOn');
	const mutationVersion = getContext('mutationVersion');
	if (QMSType == 'mutation') {
		$mutationVersion = true;
	}

	const stepsOfNodesToStepsOfFields = (stepsOfNodes) => {
		//console.log({ stepsOfNodes });
		const stepsOfFields = stepsOfNodes
			.filter((step) => {
				const [not, displayName, operator] = step;
				return displayName || operator || not;
			})
			.map((step) => {
				const [not, displayName, operator] = step;
				const stepMod = [];
				if (not) {
					stepMod.push(not);
				}
				if (displayName) {
					stepMod.push(displayName);
				}
				if (operator && (operator != 'bonded' || (operator == 'bonded' && displayName == null))) {
					stepMod.push(operator);
				}

				return stepMod;
			})
			.flat(Infinity);
		return stepsOfFields;
	};
	const getUpdatedStepsOfNodes = (stepsOfNodesParent) => {
		testName_stepsOFFieldsWasUpdated = true;
		let stepsOfNodesCopy = JSON.parse(JSON.stringify(stepsOfNodesParent));
		stepsOfNodesCopy.push([node?.not ? '_not' : undefined, node?.dd_displayName, node?.operator]);
		return stepsOfNodesCopy;
	};

	if (!testName_stepsOFFieldsWasUpdated) {
		stepsOfNodes = getUpdatedStepsOfNodes(
			JSON.parse(JSON.stringify(parentNode?.stepsOfNodes || []))
		);
	}

	$: {
		stepsOfFieldsFull = stepsOfNodesToStepsOfFields(stepsOfNodes);
		stepsOfFields = filterElFromArr(stepsOfFieldsFull, ['list', 'bonded']);
		node.stepsOfFieldsFull = stepsOfFieldsFull;
		node.stepsOfFields = stepsOfFields;
		node.stepsOfFieldsMinimal = filterElFromArr(stepsOfFields, ['_and', '_or', '_not']);
		node.stepsOfNodes = stepsOfNodes;
		node.stepsOfFieldsStringified = JSON.stringify(stepsOfFields);
	}
	export let addDefaultFields;

	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	let dragDisabled = true;
	const flipDurationMs = 500;
	function handleDndConsider(e) {
		//console.log('considering', e, nodes);
		node.items = e.detail.items;
		dragDisabled = true;
	}
	function handleDndFinalize(e) {
		node.items = e.detail.items;
		//console.log(e);
		nodes = { ...nodes };
		handleChanged();
		dispatch('changed');
		dragDisabled = true;
	}

	const deleteItem = (e) => {
		node.items = node.items.filter((item) => {
			return item.id !== e.detail.id;
		});
		// nodes[e.detail.id] = undefined;
		//!!! to do: also delete the node from "nodes"
		nodes = { ...nodes };
		handleChanged();
		dispatch('changed');
	};
	//
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
			//if (shadowEl.style.height == 0) ensures the bellow runs only once per grab of element to move
			shadowEl.style.height = `${shadowHeight + 18}px`;
			shadowEl.style.width = `${shadowWidth}px`;

			//put labelElClone in place of shadowEl
			// if (labelElClone) {
			// 	shadowEl.removeChild(labelElClone);
			// }
			labelElClone = labelEl.cloneNode(true);
			labelElClone.classList.remove('dnd-item');
			labelElClone.classList.add('border-2', 'border-accent');

			shadowEl.appendChild(labelElClone);
		}
	}
	function startDrag(e) {
		// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
		//e.preventDefault();
		dragDisabled = false;
	}
	function handleKeyDown(e) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
	}
	const transformDraggedElement = (draggedEl, data, index) => {
		draggedEl?.classList.add('bg-accent/25', 'border-2', 'border-accent');
		draggedEl
			.querySelector('.dnd-item')
			?.classList.add('bg-accent/25', 'border-2', 'border-accent');
	};
	//

	const handleChanged = () => {
		finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};

	let argsInfo = QMS_info?.args;
	let showModal = false;

	let groupDisplayTitle = '';
	$: {
		groupDisplayTitle = '';
		//if (node?.not) {
		//	groupDisplayTitle = `${groupDisplayTitle}_not `;
		//}
		if (node.dd_displayName) {
			groupDisplayTitle = `${groupDisplayTitle}${node.dd_displayName}`;
		}

		if (node?.operator != 'bonded') {
			if (groupDisplayTitle.trim() != '') {
				groupDisplayTitle = `${groupDisplayTitle} `;
			}

			if (node?.operator == 'list') {
				groupDisplayTitle = `${groupDisplayTitle} (list)`;
			}
			if (['_and', '_or'].includes(node?.operator)) {
				groupDisplayTitle = `${groupDisplayTitle}${node?.operator} (list)`;
			}
		}
		if (groupDisplayTitle.trim() == '' || getPreciseType(groupDisplayTitle) == 'undefined') {
			if (node?.operator == 'bonded') {
				groupDisplayTitle = '(item)'; //bonded
			} else if (node?.operator == '~spread~') {
				groupDisplayTitle = '(~spread~)'; //~spread~
			}
		}
		groupDisplayTitle = `${groupDisplayTitle}`;
		//groupDisplayTitle = stepsOfNodes.join('->') + `(${groupDisplayTitle})`;
	}

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
	let showSelectModal = false;

	let showAddModal = false;
	let rowSelectionState = {};
	const getRowSelectionState = (selectedRowsModel) => {
		let rowSelectionState = {};
		console.log({ selectedRowsModel });
		if (!selectedRowsModel?.rows) {
			return rowSelectionState;
		}
		selectedRowsModel.rows.forEach((row) => {
			rowSelectionState[row.id] = true;
		});
		return rowSelectionState;
	};
	let selectedRowsModel = {};
	import ExplorerTable from '$lib/components/ExplorerTable.svelte';
	import { string_transformer } from '$lib/utils/dataStructureTransformers.ts';
	import { writable } from 'svelte/store';
	import AddNodeToControlPanel from './AddNodeToControlPanel.svelte';
	import GroupDescriptionAndControls from './GroupDescriptionAndControls.svelte';
	import ManyToAllSelectInterfaceDefinition from './ManyToAllSelectInterfaceDefinition.svelte';
	import SelectedRowsDisplay from './SelectedRowsDisplay.svelte';

	let selectedRowsColValues = [];

	//------------
	let inputColumnsLocationQMS_Info;
	//!! todo:before getting inputColumnsLocation value,you should check if it is a query or a mutation,and handle it accordingly
	let inputColumnsLocation = $endpointInfo.inputColumnsPossibleLocationsInArg.find((path) => {
		inputColumnsLocationQMS_Info = getDeepField(node, path, schemaData, 'inputFields');
		return inputColumnsLocationQMS_Info;
	});
	//should work
	let idColName;

	$: if (QMSWraperContextForSelectedQMS) {
		idColName = QMSWraperContextForSelectedQMS.idColName;
	}
	//should work
	console.log({ node, inputColumnsLocationQMS_Info, inputColumnsLocation });
	//------------

	let QMSWraperContextForSelectedQMS = {};
	$: console.log({ QMSWraperContextForSelectedQMS });
	let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
	let forceShowSelectAndAddButtons = false;
</script>

{#if visible}
	{#if showAddModal}
		<Modal
			showApplyBtn={false}
			on:cancel={() => {
				showAddModal = false;
			}}
		/>
	{/if}

	{#if showModal}
		<Modal
			showApplyBtn={false}
			on:cancel={() => {
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
						on:click={() => {
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
										on:change|preventDefault|stopPropagation={() => {
											if (!node?.isMain) {
												node.not = !node.not;
												operatorChangeHandler();
												handleChanged();
												dispatch('changed');
											}
										}}
									/>
								</label>
							</div>
						{/if}

						<btn
							class="btn btn-xs btn-info  normal-case mb-6 flex-1"
							on:click={() => {
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
							on:click={() => {
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
								dispatch('changed');
							}}
						>
							change
						</btn>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<btn
							class="btn btn-xs btn-warning  mb-6 flex-1"
							on:click={() => {
								alert('not yet implemented');
								console.log(
									'not yet implemented,implement here.Delete node and his items and items of his items recursively until the very end of the tree.'
								);
							}}
						>
							<i class="bi bi-trash-fill" />
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
						on:updateQuery
						bind:group
						bind:argsInfo
						{nodes}
						{node}
					/>
				</div>
			</div>
		</Modal>{/if}

	<SelectModal
		on:deleteSubNode={(e) => {
			deleteItem(e);
			//
			//console.log(e.detail.id, node);
		}}
		bind:selectedQMS={getManyQMS}
		bind:selectedRowsColValues
		bind:showSelectModal
		{originalNodes}
		on:updateQuery
		{type}
		bind:nodes
		{node}
		{parentNode}
		{parentNodeId}
		on:changed
		{availableOperators}
		on:childrenStartDrag={startDrag}
		{group}
	/>

	{#if !node?.isMain}
		<div class="   grid   content-center  rounded-full w-min-max w-max">
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
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
						on:mousedown={(e) => {
							// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
							e.preventDefault();

							dispatch('childrenStartDrag');
						}}
						on:touchstart={(e) => {
							// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
							e.preventDefault();

							dispatch('childrenStartDrag');
						}}
						on:keydown={handleKeyDown}
						on:contextmenu|preventDefault|stopPropagation={() => {
							//
						}}
					/>
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
						on:click={() => {
							showModal = true;
						}}
						on:contextmenu|preventDefault|stopPropagation={() => {
							//
						}}
					>
						{groupDisplayTitle}
						<!-- <sub>{stepsOfFields.join('->')}</sub> -->
						{#if node.dd_NON_NULL}
							<sup>
								<i class="text-primary bi bi-asterisk" />
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
		on:contextmenu|preventDefault|stopPropagation={() => {
			//
		}}
		bind:this={labelEl}
		on:mousedown={() => {
			dragDisabled = true;
		}}
		on:touchstart={() => {
			dragDisabled = true;
		}}
		on:keydown={() => {
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
						on:click={() => {
							showModal = true;
						}}
						on:contextmenu|preventDefault|stopPropagation={() => {
							showSelectModal = !showSelectModal;
						}}
					>
						{groupDisplayTitle}
						{#if node.dd_NON_NULL}
							<sup>
								<i class="text-primary bi bi-asterisk" />
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
				<!-- svelte-ignore a11y-click-events-have-key-events -->
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
						on:click={() => {
							showModal = true;
						}}
					>
						{groupDisplayTitle}
						{#if node.dd_NON_NULL}
							<sup>
								<i class="text-primary bi bi-asterisk" />
							</sup>
						{/if}
					</div>
				{/if}
				<p class="grow" />
			</div>
		{:else}
			<div class="pr-2 rounded-box  w-full">
				<div class=" transition-color duration-500 rounded-box ringxxx  ring-1xxx    ">
					<ActiveArgument
						bind:selectedRowsColValues
						bind:showSelectModal
						on:updateQuery
						bind:nodes
						on:changed
						on:childrenStartDrag={startDrag}
						{parentNode}
						{node}
						on:contextmenuUsed={() => {
							if (!node?.isMain) {
								node.not = !node.not;
								handleChanged();
								dispatch('changed');
							}
						}}
						isNot={node.not}
						on:updateQuery
						on:inUseChanged={() => {}}
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
				on:consider={handleDndConsider}
				on:finalize={handleDndFinalize}
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
										<svelte:self
											on:deleteSubNode={(e) => {
												deleteItem(e);
												//
												//console.log(e.detail.id, node);
											}}
											{originalNodes}
											on:updateQuery
											{type}
											bind:nodes
											node={nodes[item.id]}
											parentNode={node}
											parentNodeId={node.id}
											on:changed
											{availableOperators}
											on:childrenStartDrag={startDrag}
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
		<div class=" ml-8 h-0     top-0 left-0 visible" id="shadowEl" bind:this={shadowEl} />
	{/if}
{/if}
