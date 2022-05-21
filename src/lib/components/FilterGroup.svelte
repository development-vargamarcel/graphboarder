<script>
	import FilterItem from './FilterItem.svelte';
	import FilterChoises from './FilterChoises.svelte';
	import { elementToDisplay, get_KindsArray, get_NamesArray } from '$lib/utils/usefulFunctions';

	export let id;
	export let choises;
	export let title;
	export let modalTitle = title;
	export let type;
	export let chosenDefault;
	export let chosen;
	export let extraData;
	let filterAppliedData;
	let relatedField;
</script>

<div class="flex">
	<FilterItem
		{extraData}
		{id}
		{choises}
		{title}
		{modalTitle}
		{type}
		{chosenDefault}
		{chosen}
		on:filterApplied={(e) => {
			let { detail } = e;
			filterAppliedData = detail;
			relatedField = filterAppliedData.extraData.inputFields?.filter((el) => {
				return el.dd_displayName == filterAppliedData.chosen;
			})[0];

			console.log('relatedField', relatedField);
			console.log('detail', detail);
			chosen = detail.chosen;
		}}
	/>
	{#if filterAppliedData}
		{#if filterAppliedData.extraData.dd_displayType == 'INPUT_OBJECT'}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				{#if relatedField.dd_kindList}
					<textarea class="textarea textarea-primary textarea-xs w-40 mr-2" />
				{:else if relatedField.dd_displayType == 'boolean'}
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label  w-40">
						<div class="flex">
							<input type="checkbox" class="checkbox input-primary" />
							<p class="pl-2">true</p>
						</div>
					</label>
				{:else if relatedField.dd_displayType == 'geo'}
					<input
						type={relatedField.dd_displayType}
						class="input input-primary input-xs w-20 h-20 mr-2 "
						placeholder="map here"
					/>
				{:else}
					<input
						type={relatedField.dd_displayType}
						class="input input-primary input-xs w-40 mr-2"
					/>{/if}
			</label>
		{/if}{/if}
</div>
