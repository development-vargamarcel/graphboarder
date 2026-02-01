<script lang="ts">
	import {
		filterElFromArr,
		formatData,
		getDataGivenStepsOfFields,
		getDeepField,
		getPreciseType,
		getQMSWraperCtxDataGivenControlPanelItem,
		getRootType,
		hasDeepProperty,
		passAllObjectValuesThroughStringTransformerAndReturnNewObject,
		nodeAddDefaultFields
	} from '../utils/usefulFunctions';
	import { flip } from 'svelte/animate';
	import { dndzone, SHADOW_PLACEHOLDER_ITEM_ID } from 'svelte-dnd-action';
	import { getContext, setContext, untrack } from 'svelte';
	import ActiveArgument from '$lib/components/ActiveArgument.svelte';
	import ActiveArgumentsGroup_addFilterAndSortingButtonContent from '$lib/components/ActiveArgumentsGroup_addFilterAndSortingButtonContent.svelte';
	import Modal from './Modal.svelte';
	import SelectItem from './SelectItem.svelte';
	import SelectQMS from './SelectQMS.svelte';
	import Fuse from 'fuse.js';
	import ExplorerTable from '$lib/components/ExplorerTable.svelte';
	import { string_transformer } from '$lib/utils/dataStructureTransformers';
	import { writable } from 'svelte/store';
	import AddNodeToControlPanel from './AddNodeToControlPanel.svelte';
	import GroupDescriptionAndControls from './GroupDescriptionAndControls.svelte';
	import { Logger } from '$lib/utils/logger';
	import {
		createQMSSearchInstance,
		discoverMatchingQMS,
		getReturningFields
	} from '$lib/utils/searchUtils';
	import {
		getRowSelectionState,
		processSelectedRowsColValues,
		getRequiredColumnNames
	} from '$lib/utils/rowSelectionUtils';
	import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';

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
		addDefaultFields?: any;
		showSelectModal: any;
		onChanged?: () => void;
		onChildrenStartDrag?: (e?: any) => void;
		onUpdateQuery?: () => void;
		onDeleteSubNode?: (detail: { id: string }) => void;
	}

	let {
		nodes = $bindable(),
		parentNodeId,
		parentNode = nodes[parentNodeId],
		node = $bindable(),
		availableOperators,
		group,
		type,
		originalNodes,
		prefix = '',
		addDefaultFields,
		showSelectModal = $bindable(),
		onChanged,
		onUpdateQuery,
		onChildrenStartDrag,
		onDeleteSubNode
	}: Props = $props();

	// State declarations
	let stepsOfNodes = $state<any[]>([]);
	let stepsOfFields = $state<any[]>([]);
	let stepsOfFieldsFull = $state<any[]>([]);
	let testName_stepsOFFieldsWasUpdated = false;
	let labelEl: HTMLElement | undefined = $state();
	let shadowEl = $state<HTMLElement>();
	let shadowHeight = $state(20);
	let shadowWidth = $state(20);
	let labelElClone = $state<Node>();
	let groupDisplayTitle = $state('');
	let showAddModal = false;
	let selectedRowsModel = $state<any>({});
	let QMSWraperContextForSelectedQMS = $state<any>({});
	let getManyQMS = $state<any>();
	let showSelectQMSModal = $state(false);
	let dragDisabled = true;

	Logger.debug({ node });

	// Context setup - must be after props declaration
	const OutermostQMSWraperContext = getContext<QMSWraperContext>(
		`${untrack(() => prefix)}OutermostQMSWraperContext`
	);

	const nodeContext = getContext<any>(`${untrack(() => prefix)}nodeContext`);
	let pathIsInCP = $derived(nodeContext?.pathIsInCP || false);

	let nodeIsInCP = false;
	const CPItemContext = getContext<any>(`${untrack(() => prefix)}CPItemContext`);
	if (CPItemContext?.CPItem?.nodeId == node?.id) {
		setContext(`${untrack(() => prefix)}nodeContext`, { pathIsInCP: true });
		nodeIsInCP = true;
	}
	const isCPChild = CPItemContext ? true : false;
	let visibleInCP = $derived(pathIsInCP || nodeIsInCP);
	let visible = $derived(visibleInCP || !CPItemContext || node?.isMain);

	let correctQMSWraperContext: any = '';
	if (isCPChild) {
		correctQMSWraperContext = getQMSWraperCtxDataGivenControlPanelItem(
			CPItemContext?.CPItem,
			OutermostQMSWraperContext
		);
	} else {
		correctQMSWraperContext = getContext(`${untrack(() => prefix)}QMSWraperContext`);
	}

	const { finalGqlArgObj_Store, QMS_info, activeArgumentsDataGrouped_Store, QMSType } = $derived(
		correctQMSWraperContext || {}
	);

	const dndIsOn = getContext<any>('dndIsOn');
	const mutationVersion = getContext<any>('mutationVersion');
	$effect(() => {
		if (QMSType == 'mutation' && mutationVersion) {
			$mutationVersion = true;
		}
	});

	let mainWraperCtx = getContext<QMSMainWraperContext>(
		`${untrack(() => prefix)}QMSMainWraperContext`
	);
	const endpointInfo = mainWraperCtx?.endpointInfo;
	const schemaData = mainWraperCtx?.schemaData;

	const stepsOfNodesToStepsOfFields = (stepsOfNodes: any[]): string[] => {
		const stepsOfFields = stepsOfNodes
			.filter((step: any) => {
				const [not, displayName, operator] = step;
				return displayName || operator || not;
			})
			.map((step: any) => {
				const [not, displayName, operator] = step;
				const stepMod: string[] = [];
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
			.flat(Infinity) as string[];
		return stepsOfFields;
	};

	const getUpdatedStepsOfNodes = (stepsOfNodesParent: any[]): any[] => {
		testName_stepsOFFieldsWasUpdated = true;
		let stepsOfNodesCopy = JSON.parse(JSON.stringify(stepsOfNodesParent));
		stepsOfNodesCopy.push([node?.not ? '_not' : undefined, node?.dd_displayName, node?.operator]);
		return stepsOfNodesCopy;
	};

	const operatorChangeHandler = () => {
		stepsOfNodes = getUpdatedStepsOfNodes(
			JSON.parse(JSON.stringify(parentNode?.stepsOfNodes || []))
		);
	};

	if (!testName_stepsOFFieldsWasUpdated) {
		stepsOfNodes = getUpdatedStepsOfNodes(
			JSON.parse(JSON.stringify(untrack(() => parentNode)?.stepsOfNodes || []))
		);
	}

	const flipDurationMs = 500;
	function handleDndConsider(e: any) {
		node.items = e.detail.items;
		dragDisabled = true;
	}
	function handleDndFinalize(e: any) {
		node.items = e.detail.items;
		nodes = { ...nodes };
		handleChanged();
		onChanged?.();
		dragDisabled = true;
	}

	const deleteItem = (e: any) => {
		node.items = node.items.filter((item: any) => {
			return item.id !== e.detail.id;
		});
		nodes = { ...nodes };
		handleChanged();
		onChanged?.();
	};

	function startDrag(e: any) {
		dragDisabled = false;
	}
	function handleKeyDown(e: KeyboardEvent) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
	}
	const transformDraggedElement = (draggedEl: HTMLElement, data: any, index: number) => {
		draggedEl?.classList.add('bg-accent/25', 'border-2', 'border-accent');
		draggedEl
			.querySelector('.dnd-item')
			?.classList.add('bg-accent/25', 'border-2', 'border-accent');
	};

	const dragDisabledConstantTest = true;

	const handleChanged = () => {
		finalGqlArgObj_Store?.regenerate_groupsAndfinalGqlArgObj();
	};

	let argsInfo = $derived(QMS_info?.args);
	let showModal = false;

	$effect(() => {
		if (node?.addDefaultFields || (node?.isMain && addDefaultFields)) {
			nodeAddDefaultFields(
				node,
				prefix,
				group,
				activeArgumentsDataGrouped_Store,
				schemaData,
				endpointInfo
			);
		}
	});

	let showExplorerTable = true;
	const fuse = schemaData ? createQMSSearchInstance($schemaData?.queryFields) : null;
	const nodeContext_forDynamicData = getContext<any>(
		`${untrack(() => prefix)}nodeContext_forDynamicData`
	);
	let selectedQMS = nodeContext_forDynamicData?.selectedQMS;
	let QMSRows = nodeContext_forDynamicData?.QMSRows;
	let rowSelectionState = nodeContext_forDynamicData?.rowSelectionState;
	let selectedRowsColValues = nodeContext_forDynamicData?.selectedRowsColValues;
	let selectedRowsColValuesProcessed = nodeContext_forDynamicData?.selectedRowsColValuesProcessed;
	let idColName = nodeContext_forDynamicData?.idColName;
	let requiredColNames = nodeContext_forDynamicData?.requiredColNames;

	let columns = [
		{
			accessorFn: (row: any) => row.dd_displayName,
			header: 'dd_displayName',
			footer: 'dd_displayName',
			enableHiding: true
		},
		{
			accessorFn: (row: any) => row.dd_rootName,
			header: 'dd_rootName',
			footer: 'dd_rootName',
			enableHiding: true
		},
		{
			accessorFn: (row: any) => (row.dd_kindList_NON_NULL ? '!' : ''),
			header: 'L',
			footer: 'L',
			enableHiding: true
		},
		{
			accessorFn: (row: any) => (row.dd_kindList ? 'list' : ''),
			header: 'LL',
			footer: 'LL',
			enableHiding: true
		},
		{
			accessorFn: (row: any) => (row.dd_kindEl_NON_NULL ? '!' : ''),
			header: 'E',
			footer: 'E',
			enableHiding: true
		},
		{
			accessorFn: (row: any) => row.dd_kindEl,
			header: 'EE',
			footer: 'EE',
			enableHiding: true
		},

		{
			accessorFn: (row: any) =>
				row.args
					?.map(
						(arg: any) =>
							`${arg.dd_displayName} (${arg.dd_kindList ? 'list of ' : ''}${arg.dd_kindEl})`
					)
					.join('; '),
			header: 'Arguments',
			footer: 'Arguments',
			enableHiding: true
		},
		{
			accessorFn: (row: any) => row.description?.replaceAll(',', ';'),
			header: 'description',
			footer: 'description',
			enableHiding: true
		}
	];

	if (node?.selectedQMS && selectedQMS) {
		$selectedQMS = node.selectedQMS;
		if (untrack(() => activeArgumentsDataGrouped_Store)) {
			$activeArgumentsDataGrouped_Store = $activeArgumentsDataGrouped_Store;
		}
	}

	let inputColumnsLocationQMS_Info: any;
	let inputColumnsLocation = endpointInfo
		? $endpointInfo?.inputColumnsPossibleLocationsInArg?.find((path: any) => {
				inputColumnsLocationQMS_Info = getDeepField(node, path, schemaData, 'inputFields');
				return inputColumnsLocationQMS_Info;
			})
		: undefined;

	Logger.debug({ node, inputColumnsLocationQMS_Info, inputColumnsLocation });

	let activeArgumentsContext = getContext<any>(`${untrack(() => prefix)}activeArgumentsContext`);
	let forceShowSelectAndAddButtons = false;
	const inputFieldsContainerLocation = endpointInfo?.get_inputFieldsContainerLocation?.(
		node,
		schemaData
	);
	const inputFieldsContainer = inputFieldsContainerLocation
		? getDeepField(node, inputFieldsContainerLocation, schemaData, 'inputFields')
		: null;
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext || {};

	$effect(() => {
		Logger.debug('qqqqqqwwwww', { getManyQMS, showSelectQMSModal });
	});

	// Effects
	$effect(() => {
		stepsOfFieldsFull = stepsOfNodesToStepsOfFields(stepsOfNodes);
		stepsOfFields = filterElFromArr(stepsOfFieldsFull, ['list', 'bonded']);
		node.stepsOfFieldsFull = stepsOfFieldsFull;
		node.stepsOfFields = stepsOfFields;
		node.stepsOfFieldsMinimal = filterElFromArr(stepsOfFields, ['_and', '_or', '_not']);
		node.stepsOfNodes = stepsOfNodes;
		node.stepsOfFieldsStringified = JSON.stringify(stepsOfFields);
	});

	$effect(() => {
		if (labelEl) {
			shadowHeight = labelEl.clientHeight;
			shadowWidth = labelEl.clientWidth;
		}
	});

	$effect(() => {
		if (shadowHeight && shadowEl) {
			if (shadowEl.style.height === '0px' || shadowEl.style.height === '') {
				shadowEl.style.height = `${shadowHeight + 18}px`;
				shadowEl.style.width = `${shadowWidth}px`;

				if (labelEl) {
					labelElClone = labelEl.cloneNode(true);
					(labelElClone as HTMLElement)?.classList?.remove('dnd-item');
					(labelElClone as HTMLElement)?.classList?.add('border-2', 'border-accent');
					shadowEl.appendChild(labelElClone);
				}
			}
		}
	});

	$effect(() => {
		groupDisplayTitle = '';
		if (node?.dd_displayName) {
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
				groupDisplayTitle = '(item)';
			} else if (node?.operator == '~spread~') {
				groupDisplayTitle = '(~spread~)';
			}
		}
		groupDisplayTitle = `${groupDisplayTitle}`;
	});

	$effect(() => {
		if (QMSWraperContextForSelectedQMS && idColName) {
			$idColName = QMSWraperContextForSelectedQMS.idColName;
		}
	});

	$effect(() => {
		Logger.debug({ QMSWraperContextForSelectedQMS });
	});

	$effect(() => {
		if (QMSFieldToQMSGetMany_Store && $QMSFieldToQMSGetMany_Store?.length > 0) {
			getManyQMS = QMSFieldToQMSGetMany_Store.getObj({
				nodeOrField: node
			})?.getMany?.selectedQMS;
			if (getManyQMS) {
				Logger.debug({ getManyQMS });
			}
		}
	});
</script>

{#if showSelectModal}
	<Modal
		onMounted={() => {
			if (QMSRows && fuse) {
				$QMSRows = discoverMatchingQMS(node, group, schemaData, fuse);

				// Auto-select if only one match
				if ($QMSRows.length == 1 && selectedQMS) {
					$selectedQMS = $QMSRows[0];
				}
			}
		}}
		showApplyBtn={true}
		onApply={() => {
			if (rowSelectionState) {
				$rowSelectionState = getRowSelectionState(selectedRowsModel);
			}
			if (requiredColNames) {
				$requiredColNames = getRequiredColumnNames(node);
			}

			if (
				selectedRowsColValuesProcessed &&
				selectedRowsColValues &&
				idColName &&
				requiredColNames
			) {
				$selectedRowsColValuesProcessed = processSelectedRowsColValues(
					$selectedRowsColValues,
					$idColName,
					$requiredColNames,
					node,
					endpointInfo,
					passAllObjectValuesThroughStringTransformerAndReturnNewObject
				);
			}

			if (selectedRowsColValuesProcessed) {
				node.selectedRowsColValues = $selectedRowsColValuesProcessed;
			}
			handleChanged();
			showSelectModal = false;
		}}
		onCancel={() => {
			showSelectModal = false;
		}}
	>
		<div class="flex flex-col">
			<div class="w-full text-lg text-center mb-2">
				<p class="badge badge-info font-bold">
					{groupDisplayTitle}
				</p>

				<SelectQMS bind:showSelectQMSModal {node} />

				{#if rowSelectionState}
					<SelectItem
						{node}
						bind:QMSWraperContext={QMSWraperContextForSelectedQMS}
						rowSelectionState={$rowSelectionState}
						enableMultiRowSelectionState={inputFieldsContainer?.dd_kindList}
						onRowSelectionChange={(detail: any) => {
							selectedRowsModel = detail;
							let selectedRowsOriginal = detail.rows.map((row: any) => row.original);

							const returningColumnsLocation =
								$endpointInfo?.returningColumnsPossibleLocationsInQueriesPerRow?.find(
									(item: any) => {
										return hasDeepProperty(selectedRowsOriginal[0], item);
									}
								);

							Logger.debug({ returningColumnsLocation });
							if (selectedRowsColValues) {
								$selectedRowsColValues = selectedRowsOriginal.map((row: any) => {
									return getDataGivenStepsOfFields(null as any, row, returningColumnsLocation);
								});
							}
						}}
						onRowClicked={(detail: any) => {
							Logger.debug(detail);
						}}
						QMS_info={$selectedQMS}
					/>
				{/if}

				<button
					class="btn btn-accent btn-xs w-full"
					onclick={() => {
						showSelectQMSModal = true;
					}}
				>
					showSelectQMSModal
				</button>
			</div>
		</div>
	</Modal>
{/if}
