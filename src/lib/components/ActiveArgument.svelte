<script>
	import { writable } from 'svelte/store';
	import AutoInterface from '$lib/components/fields/AutoInterface.svelte';
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	export let setNotInUseIfNotValid = true;
	export let setNotInUseIfNotValidAndENUM = true;
	export let parentNode;
	export let prefix = '';
	import { clickOutside } from '$lib/actions/clickOutside';
	import Modal from './Modal.svelte';
	import { string_transformerREVERSE } from '$lib/utils/dataStructureTransformers';
	import { argumentCanRunQuery, getPreciseType } from '$lib/utils/usefulFunctions';
	const { activeArgumentsDataGrouped_Store } = getContext(`${prefix}QMSWraperContext`);
	const { finalGqlArgObj_Store } = getContext(`${prefix}QMSWraperContext`);
	export let isNot;
	let dispatch = createEventDispatcher();
	export let activeArgumentData;
	export let group;
	export let activeArgumentsDataGrouped;
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
	let expandedVersion;
	let valueToDisplay = undefined;
	$: {
		if (true || activeArgumentData?.inUse) {
			valueToDisplay = get_valueToDisplay();
		}
		if (valueToDisplay !== undefined) {
			expandedVersion = false;
		} else {
			expandedVersion = true;
		}
	}

	const handleChanged = (detail) => {
		console.log('detail', detail);
		Object.assign(activeArgumentData, detail);
		activeArgumentsDataGrouped_Store.update_activeArgument(activeArgumentData, group.group_name);
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
		finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};
	const handleClickOutside = () => {
		//
		//console.log('clicked outside');
		//expandedVersion = false; //!!! this is causing the expanded version to disappear when you click outside of it,but sometimes,is not desirable like when another modal with choises opens up and if you click on anything that upper modal disappears.
	};
	const inUse_set = (inUse) => {
		activeArgumentData.inUse = inUse;
		activeArgumentsDataGrouped_Store.update_activeArgument(activeArgumentData, group.group_name);
		dispatch('inUseChanged');
		finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};
	const inUse_toggle = () => {
		inUse_set(!activeArgumentData.inUse);
	};
	let showModal = false;
	const mutationVersion = getContext('mutationVersion');
</script>

{#if showModal}
	<Modal
		showApplyBtn={false}
		on:cancel={() => {
			showModal = false;
		}}
	>
		<div class="flex flex-col">
			<div class="w-full text-lg text-center  mb-2 ">
				<p class="badge badge-info font-bold">
					<!-- {#if group.group_name == 'root'}
						{activeArgumentData.stepsOfFields?.join(' > ')}
					{:else}
						{activeArgumentData.stepsOfFields?.slice(1)?.join(' > ')}
					{/if} -->
					{activeArgumentData.stepsOfFields[activeArgumentData.stepsOfFields.length - 1]}
				</p>
			</div>

			<div class="mb-6 flex">
				{#if parentNode?.inputFields?.some((inputField) => {
					return inputField.dd_displayName == '_not';
				})}
					<div class="form-control mr-1">
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
							class="toggle toggle-sm"
							checked={activeArgumentData?.inUse}
							on:change|self|stopPropagation|capture={inUse_toggle}
						/>
					</label>
				</div>
				<btn
					class="btn btn-xs btn-warning    flex-1"
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
			</div>

			{#if activeArgumentData?.description}
				<div class="alert alert-info shadow-lg py-2 mb-2">
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="stroke-current flex-shrink-0 w-6 h-6"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
						<span>{activeArgumentData.description}</span>
					</div>
				</div>
			{/if}
			<div class="px-2 ">
				<AutoInterface
					alwaysOn_interfacePicker
					typeInfo={activeArgumentData}
					on:changed={(e) => {
						handleChanged(e.detail);
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
		 my-1 flex   dnd-item 
		 {activeArgumentData?.inUse && !$mutationVersion
		? activeArgumentData.canRunQuery
			? 'ring ring-[1px]  bg-base-200/75 ring-primary/25 '
			: 'ring ring-[1px]  ring-primary/100 bg-error/50'
		: 'bg-base-200/50'} 
		{$mutationVersion ? 'p-1 min-w-[80vw] md:min-w-[50vw]' : 'pr-[1px]'}
		"
	bind:this={labelEl}
>
	<div class="grow  ">
		<div class="  flex {$mutationVersion ? 'flex-col' : ''}  space-x-0 ">
			<input
				type="checkbox"
				class="checkbox input-primary hidden"
				on:change|self={() => {
					//leave this here,will prevent the click to go trough
				}}
			/>
			<div
				class="   text-xs  select-none flex grow flex-nowrap 
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
						
						btn-ghost text-base-content  btn   btn-xs text-xs normal-case  rounded-box  pl-1  py-0 h-full min-h-min     
						{isNot ? ' bg-gradient-to-r from-secondary/30 outline-dashed' : 'bg-error/0'}"
					on:click={() => {
						showModal = true;
					}}
					on:contextmenu|preventDefault|stopPropagation|self={() => {
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
				</button>

				<div
					class="flex flex-nowrap  overflow-x-auto  max-w-[65vw] 
								"
				>
					{#if !expandedVersion && !$mutationVersion}
						<p
							class="shrink-0 text-base-content text-xs font-light pt-[1px] mx-2 "
							on:click|preventDefault|stopPropagation|self={() => {
								expandedVersion = true;
							}}
						>
							{valueToDisplay}
						</p>
					{/if}
				</div>
			</div>
			{#if expandedVersion || $mutationVersion}
				<div class="pl-1 ">
					<AutoInterface
						typeInfo={activeArgumentData}
						on:changed={(e) => {
							handleChanged(e.detail);
						}}
					/>
				</div>
			{/if}
		</div>
	</div>
</label>

{#if activeArgumentData[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
	<div
		class=" ml-8 h-0    absolute w-11/12   top-0 left-0 visible"
		id="shadowEl"
		bind:this={shadowEl}
	/>
{/if}
