<script lang="ts">
	import Type from '$lib/components/Type.svelte';
	import Description from './Description.svelte';
	import { writable, type Writable } from 'svelte/store';
	import AutoInterface from '$lib/components/fields/AutoInterface.svelte';
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { getContext, setContext } from 'svelte';
	import type {
		ActiveArgumentData,
		ActiveArgumentGroup,
		ContainerData
	} from '$lib/types/index';
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
	import { Logger } from '$lib/utils/logger';

	interface Props {
		setNotInUseIfNotValid?: boolean;
		setNotInUseIfNotValidAndENUM?: boolean;
		parentNode: ContainerData | ActiveArgumentData;
		node: ActiveArgumentData | ContainerData;
		prefix?: string;
		isNot: boolean;
		activeArgumentData: ActiveArgumentData;
		group: ActiveArgumentGroup;
		activeArgumentsDataGrouped: ActiveArgumentGroup[];
		nodes: (ActiveArgumentData | ContainerData)[];
		originalNodes: (ActiveArgumentData | ContainerData)[];
		type: string;
		parentNodeId: string;
		availableOperators: string[];
		startDrag: (e?: any) => void;
		onChanged?: (detail: any) => void;
		onInUseChanged?: () => void;
		onContextmenuUsed?: () => void;
		onUpdateQuery?: () => void;
		onDeleteSubNode?: (detail: { id: string }) => void;
		onChildrenStartDrag?: () => void;
		showSelectModal?: boolean;
		selectedRowsColValues?: any;
	}

	let {
		setNotInUseIfNotValid = true,
		setNotInUseIfNotValidAndENUM = true,
		parentNode,
		node,
		prefix = '',
		isNot = $bindable(),
		activeArgumentData = $bindable(),
		group,
		activeArgumentsDataGrouped,
		nodes = $bindable(),
		originalNodes,
		type,
		parentNodeId,
		availableOperators,
		startDrag,
		onChanged,
		onInUseChanged,
		onContextmenuUsed,
		onUpdateQuery,
		onDeleteSubNode,
		onChildrenStartDrag,
		showSelectModal = $bindable(false),
		selectedRowsColValues = $bindable()
	}: Props = $props();

	const deleteItem = (arg: { detail: { id: string } }) => {
		onDeleteSubNode?.(arg.detail);
	};

	const QMSWraperContext = getContext<any>(`${prefix}QMSWraperContext`);
	const { activeArgumentsDataGrouped_Store, finalGqlArgObj_Store } = QMSWraperContext || {};

	let idColNameOfSelectedRow: string | undefined;

	setContext(
		'choosenDisplayInterface',
		writable(activeArgumentData.chosenDisplayInterface || activeArgumentData.dd_displayInterface)
	);
	let showDescription: boolean = false;
	let labelEl: HTMLLabelElement | undefined = $state();
	let shadowEl: HTMLDivElement | undefined = $state();
	let shadowHeight: number = $state(20);
	let shadowWidth: number = $state(20);

	let labelElClone: Node | undefined = $state();

	// Update shadow dimensions when labelEl changes
	$effect(() => {
		if (labelEl) {
			shadowHeight = labelEl.clientHeight;
			shadowWidth = labelEl.clientWidth;
		}
	});

	// Setup shadow element when dimensions are available
	$effect(() => {
		if (shadowHeight && shadowEl && labelEl) {
			if (shadowEl.style.height === '0px' || shadowEl.style.height === '') {
				shadowEl.style.height = `${shadowHeight + 18}px`;
				shadowEl.style.width = `${shadowWidth}px`;

				labelElClone = labelEl.cloneNode(true) as Node;
				(labelElClone as HTMLElement).classList.remove('dnd-item');
				(labelElClone as HTMLElement).classList.add('border-2', 'border-accent');

				shadowEl.appendChild(labelElClone);
			}
		}
	});

	Logger.debug({ activeArgumentData });

	let get_valueToDisplay = (): string | undefined => {
		let value: string | undefined;
		if (getPreciseType(activeArgumentData.chd_dispatchValue) == 'number') {
			value = String(activeArgumentData.chd_dispatchValue);
		}
		if (activeArgumentData.dd_displayInterface == 'ENUM') {
			let chd_dispatchValue = activeArgumentData.chd_dispatchValue as string;
			value = chd_dispatchValue?.length > 0 ? chd_dispatchValue : undefined;
		} else {
			if (Array.isArray(activeArgumentData.chd_dispatchValue)) {
				value = activeArgumentData.chd_dispatchValue.join(', ');
			} else if (typeof activeArgumentData.chd_dispatchValue == 'string') {
				value = string_transformerREVERSE(
					(activeArgumentData.chd_dispatchValue as string) || (activeArgumentData.defaultValue as string)
				);
			}
		}

		if (activeArgumentData.chd_dispatchValue && activeArgumentData.dd_displayInterface == 'geo') {
			value = '[map]';
		}

		return value;
	};

	const CPItemContext = getContext<any>(`${prefix}CPItemContext`);
	const CPItem = CPItemContext?.CPItem;
	let expandedVersion: boolean = $state(!!CPItemContext);
	let valueToDisplay: string | undefined = $state(undefined);

	// Update valueToDisplay and expandedVersion
	$effect(() => {
		if (true || activeArgumentData?.inUse) {
			valueToDisplay = get_valueToDisplay();
		}
		if (!CPItemContext) {
			expandedVersion = false;
		} else {
			expandedVersion = true;
		}
	});

	const outermostQMSWraperContext = getContext<any>(`${prefix}OutermostQMSWraperContext`);
	const { mergedChildren_QMSWraperCtxData_Store } = outermostQMSWraperContext;

	const handleChanged = (detail: Partial<ActiveArgumentData>): void => {
		Logger.debug('detail', detail);
		Object.assign(activeArgumentData, detail);

		const isValid: boolean = argumentCanRunQuery(activeArgumentData);
		const isInUse: boolean | undefined = activeArgumentData.inUse;
		const isENUM: boolean = activeArgumentData.dd_displayInterface == 'ENUM';
		Logger.debug({ isValid });
		if (!isInUse && isValid) {
			inUse_set(true);
		} else if (setNotInUseIfNotValidAndENUM && isInUse && isENUM && !isValid) {
			inUse_set(false);
		} else if (setNotInUseIfNotValid && isInUse && !isValid) {
			inUse_set(false);
		}
		onChanged?.(detail);
		// Logger.debug('activeArgumentsDataGrouped_Store', activeArgumentsDataGrouped_Store);
		updateActiveArgument();
		//finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};
	const handleClickOutside = (): void => {
		//
		//Logger.debug('clicked outside');
		//expandedVersion = false; //!!! this is causing the expanded version to disappear when you click outside of it,but sometimes,is not desirable like when another modal with choises opens up and if you click on anything that upper modal disappears.
	};

	const updateActiveArgument = (): void => {
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
	const inUse_set = (inUse: boolean): void => {
		activeArgumentData.inUse = inUse;
		updateActiveArgument();

		onInUseChanged?.();
		//finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};
	const inUse_toggle = (): void => {
		inUse_set(!activeArgumentData.inUse);
	};
	let showModal: boolean = $state(false);
	const mutationVersion = getContext<Writable<boolean>>('mutationVersion');
	const showInputField = getContext<Writable<boolean>>('showInputField');

	let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
	let context = getContext<any>(`${prefix}QMSMainWraperContext`);
	const schemaData = context?.schemaData;
	const nodeRootType = getRootType(null, activeArgumentData.dd_rootName, schemaData);
	const OutermostQMSWraperContext = getContext<any>(`${prefix}OutermostQMSWraperContext`);

	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	let selectedQMS = $state<any>();

	// Update selectedQMS when store changes
	$effect(() => {
		if ($QMSFieldToQMSGetMany_Store.length > 0) {
			selectedQMS = QMSFieldToQMSGetMany_Store.getObj({
				nodeOrField: node
			})?.getMany?.selectedQMS;
		}
	});

	const nodeContext_forDynamicData = getContext<any>(`${prefix}nodeContext_forDynamicData`);
	let contextSelectedRowsColValuesStore = nodeContext_forDynamicData?.selectedRowsColValues;
	let contextSelectedRowsColValues = $state<any[]>([]);
	$effect(() => {
		if (contextSelectedRowsColValuesStore) {
			const unsub = contextSelectedRowsColValuesStore.subscribe((v: any) => contextSelectedRowsColValues = v);
			return unsub;
		}
	});

	let finalSelectedRowsColValues = $derived(selectedRowsColValues ?? contextSelectedRowsColValues);

	// Event handler helpers
	const handleCheckboxChange = (e: Event) => {
		if (e.target === e.currentTarget) {
			// leave this here, will prevent the click to go through
		}
	};

	const handleInUseToggle = (e: Event) => {
		if (e.target === e.currentTarget) {
			e.stopPropagation();
			inUse_toggle();
		}
	};

	const handleContextMenu = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			e.preventDefault();
			e.stopPropagation();
			showSelectModal = !showSelectModal;
			expandedVersion = !expandedVersion;
		}
	};

	const handleValueClick = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
			e.preventDefault();
			e.stopPropagation();
			expandedVersion = true;
		}
	};
</script>

<SelectModal
	onDeleteSubNode={(detail) => {
		deleteItem({ detail });
		//
		//Logger.debug(detail.id, node);
	}}
	bind:showSelectModal
	{onUpdateQuery}
	bind:nodes
	{onChanged}
	onChildrenStartDrag={startDrag}
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
		onCancel={() => {
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
								onchange={() => {
									onContextmenuUsed?.();
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
							onchangecapture={handleInUseToggle}
						/>
					</label>
				</div>
				<button
					class="btn btn-xs btn-warning flex-1"
					aria-label="Delete"
					onclick={() => {
						activeArgumentsDataGrouped_Store.delete_activeArgument(
							activeArgumentData,
							group.group_name
						);
						finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
					}}
				>
					<i class="bi bi-trash-fill"></i>
				</button>
				{#if !CPItemContext}
					<AddNodeToControlPanel {node} />
				{/if}
				{#if CPItemContext}
					<GroupDescriptionAndControls hasGroup_argsNode={!!group.group_argsNode} />
				{/if}
			</div>

			<div class="px-2">
				<AutoInterface
					alwaysOn_interfacePicker
					typeInfo={activeArgumentData}
					onChanged={(detail) => {
						handleChanged(detail);
					}}
				/>
			</div>
			<Description QMSInfo={activeArgumentData} />
			<div class="mt-2 w-full overflow-x-auto">
				<Type
					index={0}
					type={activeArgumentData}
					stepsOfFields={activeArgumentData.stepsOfFields}
					template="default"
					depth={0}
				/>
			</div>
		</div>
	</Modal>{/if}

<!-- svelte-ignore a11y_label_has_associated_control -->
<label
	use:clickOutside
	onclick_outside={handleClickOutside}
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
				onchange={handleCheckboxChange}
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
					onclick={() => {
						showModal = true;
					}}
					oncontextmenu={handleContextMenu}
				>
					<!-- {#if group.group_name == 'root'}
						{activeArgumentData.stepsOfFields?.join(' > ') + ':'}
					{:else}
						{activeArgumentData.stepsOfFields?.slice(1)?.join(' > ') + ':'}
					{/if} -->
					{activeArgumentData.stepsOfFields[activeArgumentData.stepsOfFields.length - 1]}
					{#if activeArgumentData.dd_NON_NULL}
						<sup>
							<i class="text-primary bi bi-asterisk"></i>
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
						<div
							class="shrink-0 text-base-content text-xs font-light pt-[1px] mx-2 cursor-pointer"
							onclick={handleValueClick}
							role="button"
							tabindex="0"
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									handleValueClick(e as unknown as MouseEvent);
								}
							}}
						>
							{valueToDisplay}
						</div>
					{/if}
				</div>
			</div>
			{#if expandedVersion || $mutationVersion || $showInputField}
				{#if finalSelectedRowsColValues?.length > 0}
					<SelectedRowsDisplay />
				{:else}
					<div class="pl-1">
						<AutoInterface
							typeInfo={activeArgumentData}
							onChanged={(detail) => {
								handleChanged(detail);
							}}
						/>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</label>

{#if activeArgumentData[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
	<div class=" ml-8 h-0 absolute w-11/12 top-0 left-0 visible" id="shadowEl" bind:this={shadowEl}></div>
{/if}
