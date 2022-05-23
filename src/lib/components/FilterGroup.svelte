<script>
	import FilterItem from './FilterItem.svelte';
	import FilterChoises from './FilterChoises.svelte';
	import { elementToDisplay, get_KindsArray, get_NamesArray } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher } from 'svelte';

	export let id;
	export let choises;
	export let title;
	export let modalTitle = title;
	export let type;
	export let chosenDefault;
	export let chosen;
	export let extraData;
	let dispatch = createEventDispatcher();
	let detail;
	let chosenInputField;
	let inputEl;
	let rawValue = '';
	let dispatchValue;
	let isINPUT_OBJECT = false;
	let fillValue;
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
			chosenInputField = detail.extraData.inputFields?.filter((el) => {
				return el.dd_displayName == detail.chosen;
			})[0];
			if (chosenInputField && dispatchValue) {
				//	dispatch('changed', { chd_chosen: detail.chosen, chd_dispatchValue:dispatchValue }); //chd_ == chosen data
			} else {
				dispatch('changed', { chd_chosen: detail.chosen, chd_dispatchValue: undefined }); //chd_ == chosen data
			}
			console.log('chosenInputField', chosenInputField);
			console.log('detail', detail);
			isINPUT_OBJECT = detail.extraData.dd_displayType == 'INPUT_OBJECT';
			chosen = detail.chosen;
		}}
	/>

	{#if isINPUT_OBJECT}
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">
			{#if chosenInputField.dd_kindList}
				<textarea
					class="textarea textarea-primary textarea-xs w-40 mr-2"
					bind:this={inputEl}
					value={rawValue}
					on:keyup={() => {
						rawValue = inputEl.value;
						dispatchValue = rawValue.split('\n');
						dispatch('changed', { chd_chosen: chosen, chd_dispatchValue: dispatchValue }); //chd_ == chosen data
					}}
				/>
			{:else if chosenInputField.dd_displayType == 'boolean'}
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label  w-40">
					<div class="flex">
						<input
							type="checkbox"
							class="checkbox input-primary"
							bind:this={inputEl}
							checked={rawValue == 'true' ? true : false}
							on:change={() => {
								rawValue = inputEl.checked;
								dispatch('changed', { chd_chosen: chosen, chd_dispatchValue: rawValue }); //chd_ == chosen data
							}}
						/>
						<p class="pl-2">true</p>
					</div>
				</label>
			{:else if chosenInputField.dd_displayType == 'geo'}
				<input
					type={chosenInputField.dd_displayType}
					class="input input-primary input-xs w-20 h-20 mr-2 "
					placeholder="map here"
					bind:this={inputEl}
					value={rawValue}
					on:keyup={() => {
						rawValue = inputEl.value;
						dispatch('changed', { chd_chosen: chosen, chd_dispatchValue: rawValue }); //chd_ == chosen data
					}}
				/>
			{:else}
				<input
					type={chosenInputField.dd_displayType}
					class="input input-primary input-xs w-40 mr-2"
					bind:this={inputEl}
					value={rawValue}
					on:keyup={() => {
						rawValue = inputEl.value;
						dispatch('changed', { chd_chosen: chosen, chd_dispatchValue: rawValue }); //chd_ == chosen data
					}}
				/>{/if}
		</label>
	{/if}
</div>
