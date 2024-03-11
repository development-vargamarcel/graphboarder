<script>
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
	} from '../utils/usefulFunctions.ts';
	//!!! chnage bonded to item
	import { flip } from 'svelte/animate';
	import { dndzone, SHADOW_PLACEHOLDER_ITEM_ID } from 'svelte-dnd-action';
	import { createEventDispatcher, getContext, onDestroy, onMount, setContext } from 'svelte';
	import ActiveArgument from '$lib/components/ActiveArgument.svelte';
	import ActiveArgumentsGroup_addFilterAndSortingButtonContent from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButtonContent.svelte';
	import Modal from './Modal.svelte';
	import { nodeAddDefaultFields } from '$lib/utils/usefulFunctions';
	import SelectItem from './SelectItem.svelte';
	import Fuse from 'fuse.js';
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
	/////start
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
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
	const dragDisabledConstantTest = true;

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
	export let showSelectModal = false;

	let showAddModal = false;
	export let rowSelectionState = {};
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

	let showExplorerTable = true;
	const fuse = new Fuse($schemaData.queryFields, {
		includeScore: false,
		includeMatches: false,
		threshold: 0.8,
		//ignoreLocation: true,
		keys: ['dd_displayName', 'dd_rootName', 'description']
	});
	let qmsData = [];
	let columns = [
		{
			accessorFn: (row) => row.dd_displayName,
			header: 'dd_displayName',
			footer: 'dd_displayName',
			enableHiding: true
		},
		{
			accessorFn: (row) => row.dd_rootName,
			header: 'dd_rootName',
			footer: 'dd_rootName',
			enableHiding: true
		},
		{
			accessorFn: (row) => (row.dd_kindList_NON_NULL ? '!' : ''),
			header: 'L',
			footer: 'L',
			enableHiding: true
		},
		{
			accessorFn: (row) => (row.dd_kindList ? 'list' : ''),
			header: 'LL',
			footer: 'LL',
			enableHiding: true
		},
		{
			accessorFn: (row) => (row.dd_kindEl_NON_NULL ? '!' : ''),
			header: 'E',
			footer: 'E',
			enableHiding: true
		},
		{
			accessorFn: (row) => row.dd_kindEl,
			header: 'EE',
			footer: 'EE',
			enableHiding: true
		},

		{
			accessorFn: (row) =>
				row.args
					?.map(
						(arg) => `${arg.dd_displayName} (${arg.dd_kindList ? 'list of ' : ''}${arg.dd_kindEl})`
					)
					.join('; '),
			header: 'Arguments',
			footer: 'Arguments',
			enableHiding: true
		},
		{
			accessorFn: (row) => row.description?.replaceAll(',', ';'),
			header: 'description',
			footer: 'description',
			enableHiding: true
		}
	];
	export let selectedQMS;
	export let selectedRowsColValues = [];

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

{#if showSelectModal}
	<Modal
		on:mounted={() => {
			const getReturningFields = (type, matchingField, depth = 0, maxDepth = 2) => {
				if (depth > maxDepth) {
					return null;
				}
				depth++;
				let rootType = schemaData.get_rootType(null, type.dd_rootName, schemaData);
				let fields = rootType?.fields;
				if (!fields) {
					return null;
				}
				const myField = fields.find(
					(field) => field.dd_displayName == matchingField.dd_displayName
				);
				if (myField) {
					return fields;
				}
				let returningFields;
				fields.find((field) => {
					returningFields = getReturningFields(field, matchingField, depth, maxDepth);
					return returningFields; //if returningFields is undefined, the loop continues
				});
				if (returningFields) {
					return returningFields;
				}
			};
			const originType = group.originType;
			const originTypeRoot = schemaData.get_rootType(null, originType.dd_rootName, schemaData);
			const fields = getReturningFields(originType, node);
			console.log('aaaaaa', {
				originType,
				originTypeRoot,
				group,
				fields
			});

			const myField = fields?.find((field) => field.dd_displayName == node.dd_displayName);
			if (myField) {
				const myFieldRoot = schemaData.get_rootType(null, myField.dd_rootName, schemaData);
				const myFieldSubfields = myFieldRoot.fields;
				console.log('aaaaaa', {
					myField,
					myFieldRoot,
					myFieldSubfields
				});
				qmsData = $schemaData.queryFields.filter((item) => {
					return item.dd_kindList && item.dd_rootName == myField.dd_rootName;
				});
				console.log({ qmsData });
				if (qmsData.length == 1) {
					selectedQMS = qmsData[0];

					return;
				}
				if (qmsData.length > 0) {
					return;
				}

				qmsData = fuse
					.search(`${myField.dd_rootName}`)
					.map((item) => item.item)
					.filter((item) => item.dd_kindList);
				if (qmsData.length > 0) {
					return;
				}
			}
			//	console.log({ node, qmsData });
			qmsData = fuse
				.search(
					`${node?.dd_rootName?.replaceAll('_', ' ')} | ${node?.dd_displayName?.replaceAll(
						//!!!node?.dd_displayName?.replaceAll "?" might cause unexpected problems
						'_',
						' '
					)}`
				)
				.map((item) => item.item)
				.filter((item) => item.dd_kindList);
			if (qmsData.length > 0) {
				return;
			}
			qmsData = fuse
				.search(
					`${node.dd_rootName.replaceAll('_', ' ')} | ${node.dd_displayName.replaceAll('_', ' ')}`
				)
				.map((item) => item.item);
			console.log({ node, qmsData });
		}}
		showApplyBtn={true}
		on:apply={() => {
			rowSelectionState = getRowSelectionState(selectedRowsModel);
			node.selectedRowsColValues = selectedRowsColValues.map((row) => {
				let idRaw = row[idColName];
				let idDecoded = endpointInfo.get_decodedId(null, null, idRaw);

				return passAllObjectValuesThroughStringTransformerAndReturnNewObject({
					...row,
					[idColName]: idDecoded
				});
			});
			handleChanged();
			showSelectModal = false;
		}}
		on:cancel={() => {
			showSelectModal = false;
		}}
	>
		<div class="flex flex-col ">
			<div class="w-full text-lg text-center  mb-2 ">
				<p class="badge badge-info font-bold">
					{groupDisplayTitle}
				</p>
			</div>

			<div>
				{#if showExplorerTable && qmsData.length > 1}
					<!-- content here -->
					<ExplorerTable
						enableMultiRowSelectionState={false}
						bind:data={qmsData}
						{columns}
						on:rowSelectionChange={(e) => {
							selectedQMS = e.detail.rows.map((row) => row.original)[0];
							showExplorerTable = false;
							console.log({ selectedQMS });
							// let columnNames = [];
							// let rowsData;
							// rowsData = e.detail.rows.map((row, i) => {
							// 	return row
							// 		.getVisibleCells()
							// 		.map((cell) => {
							// 			if (i == 0) {
							// 				columnNames.push(cell.column.id);
							// 			}
							// 			return cell.getValue();
							// 		})
							// 		.join(`,`);
							// });
							// csvData = `${columnNames.join(`,`)}\n${rowsData.join(`\n`)}`;
						}}
					/>
				{/if}

				{#if selectedQMS}
					<SelectItem
						bind:QMSWraperContext={QMSWraperContextForSelectedQMS}
						{rowSelectionState}
						enableMultiRowSelectionState={node.dd_kindList}
						on:rowSelectionChange={(e) => {
							selectedRowsModel = e.detail;
							let selectedRowsOriginal = e.detail.rows.map((row) => row.original);

							const returningColumnsLocation =
								$endpointInfo.returningColumnsPossibleLocationsInQueriesPerRow.find((item) => {
									return hasDeepProperty(selectedRowsOriginal[0], item);
								});
							//string_transformer

							console.log({ returningColumnsLocation });
							selectedRowsColValues = selectedRowsOriginal.map((row) => {
								return getDataGivenStepsOfFields(null, row, returningColumnsLocation);

								//return getDataGivenStepsOfFields(null, row, returningColumnsLocation);
							});
							//!!every element of 'selectedRowsColValues' must be cheched like so: every element must have all values checked ,if string pass trough string transformer
							console.log(e.detail, { selectedRowsColValues });
						}}
						on:rowClicked={(e) => {
							console.log(e.detail);
						}}
						QMS_info={selectedQMS}
					/>
				{/if}
			</div>
		</div>
	</Modal>
{/if}
