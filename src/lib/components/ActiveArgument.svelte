<script>
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { createEventDispatcher, getContext } from 'svelte';

	import List from '$lib/components/fields/List.svelte';
	import FilterGroup from '$lib/components/FilterGroup.svelte';
	export let prefix = '';
	import { clickOutside } from '$lib/actions/clickOutside';
	import Interface from '$lib/components/fields/Interface.svelte';
	import Modal from './Modal.svelte';
	const { activeArgumentsDataGrouped_Store } = getContext(`${prefix}QMSWraperContext`);
	const { finalGqlArgObj_Store } = getContext(`${prefix}QMSWraperContext`);
	export let isNot;
	let dispatch = createEventDispatcher();
	export let activeArgumentData;
	export let group;
	export let activeArgumentsDataGrouped;
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
		if (activeArgumentData.dd_displayInterface == 'ENUM') {
			value = activeArgumentData.chd_chosen;
		} else {
			if (Array.isArray(activeArgumentData.chd_dispatchValue)) {
				value = activeArgumentData.chd_dispatchValue.join(', ');
			} else {
				value = activeArgumentData.chd_dispatchValue;
			}
		}

		if (value && activeArgumentData.dd_displayInterface == 'geo') {
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
		if (!activeArgumentData.inUse && get_valueToDisplay() !== undefined) {
			inUse_toggle();
		}
		dispatch('changed', detail);
		console.log('activeArgumentsDataGrouped_Store', $activeArgumentsDataGrouped_Store);
		finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};
	const handleClickOutside = () => {
		//console.log('clicked outside');
		//expandedVersion = false; //!!! this is causing the expanded version to disappear when you click outside of it,but sometimes,is not desirable like when another modal with choises opens up and if you click on anything that upper modal disappears.
	};
	const inUse_toggle = () => {
		activeArgumentData.inUse = !activeArgumentData.inUse;
		activeArgumentsDataGrouped_Store.update_activeArgument(activeArgumentData, group.group_name);
		dispatch('inUseChanged');
		finalGqlArgObj_Store.regenerate_groupsAndfinalGqlArgObj();
	};
	let showModal = false;
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
					{#if group.group_name == 'root'}
						{activeArgumentData.stepsOfFields?.join(' > ')}
					{:else}
						{activeArgumentData.stepsOfFields?.slice(1)?.join(' > ')}
					{/if}
				</p>
			</div>

			<div class="mb-6 flex">
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
				{#if activeArgumentData.dd_kindList && activeArgumentData.dd_displayInterface != 'ENUM'}
					<List
						typeInfo={activeArgumentData}
						dd_displayInterface={activeArgumentData.dd_displayInterface}
						rawValue={activeArgumentData?.chd_rawValue}
						dispatchValue={activeArgumentData?.chd_dispatchValue}
						on:changed={(e) => {
							handleChanged(e.detail);
						}}
					/>
				{:else}
					<Interface
						typeInfo={activeArgumentData}
						dd_displayInterface={activeArgumentData.dd_displayInterface}
						rawValue={activeArgumentData?.chd_rawValue}
						dispatchValue={activeArgumentData?.chd_dispatchValue}
						on:changed={(e) => {
							handleChanged(e.detail);
						}}
					/>
				{/if}
			</div>
		</div>
	</Modal>{/if}

<!-- svelte-ignore a11y-label-has-associated-control -->
<label
	use:clickOutside
	on:click_outside={handleClickOutside}
	class=" w-min-min  pr-1 md:md:max-w-[20vw]   rounded-box {expandedVersion
		? 'p-2=='
		: ''}  my-1 flex   dnd-item {activeArgumentData?.inUse
		? activeArgumentData.canRunQuery
			? 'ring ring-[1px]  bg-base-200 ring-primary/50'
			: 'ring ring-[1px]  ring-primary/50 bg-error/50'
		: 'bg-base-200/50'} "
	bind:this={labelEl}
>
	<div class="grow  ">
		<div class="  flex  space-x-0 ">
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
					class=" btn btn-ghost btn-xs text-xs normal-case  rounded-box  pl-1 font-semibold shrink-0  text-base-content 
						{isNot ? ' bg-gradient-to-r from-secondary' : 'bg-error/0'}"
					on:click={() => {
						showModal = true;
					}}
					on:contextmenu|preventDefault|stopPropagation|self={() => {
						expandedVersion = !expandedVersion;
					}}
				>
					{#if group.group_name == 'root'}
						{activeArgumentData.stepsOfFields?.join(' > ') + ':'}
					{:else}
						{activeArgumentData.stepsOfFields?.slice(1)?.join(' > ') + ':'}
					{/if}
				</button>
				<div
					class="flex flex-nowrap  overflow-x-auto  max-w-[65vw] 
								"
				>
					{#if !expandedVersion}
						<p class="shrink-0 text-base-content font-light text-sm ml-1">{valueToDisplay}</p>
					{/if}
				</div>
			</div>
			{#if expandedVersion}
				<div class="pl-1 ">
					{#if activeArgumentData.dd_kindList && activeArgumentData.dd_displayInterface != 'ENUM'}
						<List
							typeInfo={activeArgumentData}
							dd_displayInterface={activeArgumentData.dd_displayInterface}
							rawValue={activeArgumentData?.chd_rawValue}
							dispatchValue={activeArgumentData?.chd_dispatchValue}
							on:changed={(e) => {
								handleChanged(e.detail);
							}}
						/>
					{:else}
						<Interface
							typeInfo={activeArgumentData}
							dd_displayInterface={activeArgumentData.dd_displayInterface}
							rawValue={activeArgumentData?.chd_rawValue}
							dispatchValue={activeArgumentData?.chd_dispatchValue}
							on:changed={(e) => {
								handleChanged(e.detail);
							}}
						/>
					{/if}
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
