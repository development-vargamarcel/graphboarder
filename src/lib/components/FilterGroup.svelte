<script>
	import FilterItem from './FilterItem.svelte';
	import FilterChoises from './FilterChoises.svelte';
	import {
		elementToDisplay,
		getRootType_KindsArray,
		getRootType_NamesArray
	} from '$lib/utils/usefulFunctions';

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
	let displayType;
	let relatedFieldDetails;
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
			relatedField = filterAppliedData.extraData.inputFields.filter((el) => {
				return el.name == filterAppliedData.chosen;
			})[0];
			displayType = filterAppliedData.extraData.displayType;
			relatedFieldDetails = elementToDisplay({
				kinds: getRootType_KindsArray(relatedField),
				names: getRootType_NamesArray(relatedField)
			});
			console.log('relatedField', relatedField);
			console.log('relatedFieldDetails', relatedFieldDetails);
			console.log('detail', detail);
		}}
	/>
	{#if filterAppliedData}
		{#if displayType == 'INPUT_OBJECT'}
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				{#if relatedFieldDetails.expectsList}
					<textarea class="textarea textarea-primary textarea-xs w-40 mr-2" />
				{:else if relatedFieldDetails.displayType == 'boolean'}
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label  w-40">
						<div class="flex">
							<input type="checkbox" class="checkbox input-primary" />
							<p class="pl-2">true</p>
						</div>
					</label>
				{:else if relatedFieldDetails.displayType == 'geo'}
					<input
						type={relatedFieldDetails.displayType}
						class="input input-primary input-xs w-20 h-20 mr-2 "
						placeholder="map here"
					/>
				{:else}
					<input
						type={relatedFieldDetails.displayType}
						class="input input-primary input-xs w-40 mr-2"
					/>{/if}
			</label>
		{/if}{/if}
</div>
