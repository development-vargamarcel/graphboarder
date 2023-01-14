<script>
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
	import { createEventDispatcher, getContext } from 'svelte';

	import List from '$lib/components/fields/List.svelte';
	import FilterGroup from '$lib/components/FilterGroup.svelte';

	import { clickOutside } from '$lib/actions/clickOutside';
	import Interface from '$lib/components/fields/Interface.svelte';
	const activeArgumentsDataGrouped_Store = getContext('activeArgumentsDataGrouped_Store');
	const final_gqlArgObj_Store = getContext('final_gqlArgObj_Store');

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
	let valueToDisplay = () => {
		let value;
		if (activeArgumentData.dd_displayInterface == 'ENUM') {
			value = activeArgumentData.chd_chosen;
		} else {
			value = activeArgumentData.chd_dispatchValue;
		}

		if (value && activeArgumentData.dd_displayInterface == 'geo') {
			value = '[map]';
		}

		return value;
	};
	let expandedVersion = !valueToDisplay();
	const handleChanged = (detail) => {
		console.log('detail', detail);
		Object.assign(activeArgumentData, detail);
		activeArgumentsDataGrouped_Store.update_activeArgument(activeArgumentData, group.group_name);
		if (!activeArgumentData.inUse && valueToDisplay() !== undefined) {
			inUse_toggle();
		}
		dispatch('changed', detail);
		console.log('activeArgumentsDataGrouped_Store', $activeArgumentsDataGrouped_Store);
		final_gqlArgObj_Store.regenerate_groupsAndfinal_gqlArgObj();
	};
	const handleClickOutside = () => {
		//console.log('clicked outside');
		//expandedVersion = false; //!!! this is causing the expanded version to disappear when you click outside of it,but sometimes,is not desirable like when another modal with choises opens up and if you click on anything that upper modal disappears.
	};
	const inUse_toggle = () => {
		activeArgumentData.inUse = !activeArgumentData.inUse;
		activeArgumentsDataGrouped_Store.update_activeArgument(activeArgumentData, group.group_name);
		dispatch('inUseChanged');
		final_gqlArgObj_Store.regenerate_groupsAndfinal_gqlArgObj();
	};
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label
	use:clickOutside
	on:click_outside={handleClickOutside}
	class="   rounded-box {expandedVersion
		? 'p-2'
		: ''}  my-1 flex   dnd-item {activeArgumentData?.inUse
		? activeArgumentData.canRunQuery
			? 'ring ring-[1px]  bg-base-300 ring-primary/50'
			: 'ring ring-[1px]  ring-primary/50 bg-error/50'
		: 'bg-base-200'} "
	bind:this={labelEl}
	on:contextmenu|preventDefault|stopPropagation={() => {
		dispatch('contextmenuUsed');
	}}
>
	<div class="grow ">
		<div class="  flex  space-x-2 ">
			<input
				type="checkbox"
				class="checkbox input-primary hidden"
				checked={activeArgumentData?.inUse}
				on:change={inUse_toggle}
			/>
			<div class="   text-xs  select-none flex grow flex-nowrap pt-1">
				<div class="flex flex-nowrap  overflow-x-auto  max-w-[65vw] ">
					<p class="  pr-1 font-semibold shrink-0  text-base-content">
						{#if group.group_name == 'root'}
							{activeArgumentData.stepsOfFields?.join(' > ') + ':'}
						{:else}
							{activeArgumentData.stepsOfFields?.slice(1)?.join(' > ') + ':'}
						{/if}
					</p>

					{#if !expandedVersion}
						<p class="shrink-0 text-base-content font-light">{valueToDisplay()}</p>
					{/if}
				</div>
			</div>
			{#if expandedVersion}
				{#if activeArgumentData.description}
					<button
						class="btn btn-xs bi bi-info-circle mx-2"
						title={activeArgumentData.description}
						on:click={() => {
							showDescription = !showDescription;
						}}
					/>
				{/if}
				<button
					class="btn btn-xs"
					on:click={() => {
						activeArgumentsDataGrouped_Store.delete_activeArgument(
							activeArgumentData,
							group.group_name
						);
						final_gqlArgObj_Store.regenerate_groupsAndfinal_gqlArgObj();
					}}><i class="bi bi-trash3-fill" /></button
				>
			{/if}

			<button
				class="btn btn-xs {expandedVersion ? 'btn-primary ' : '  '}"
				on:click={() => {
					expandedVersion = !expandedVersion;
				}}><i class="bi bi-chevron-expand" /></button
			>
		</div>
		{#if showDescription && expandedVersion}
			<p class="text-secondary text-xs select-none">
				({activeArgumentData.description})
			</p>
		{/if}
		{#if expandedVersion}
			<div class="px-2 mt-2">
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
</label>

{#if activeArgumentData[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
	<div
		class=" ml-8 h-0    absolute w-11/12   top-0 left-0 visible"
		id="shadowEl"
		bind:this={shadowEl}
	/>
{/if}
