<script>
	import FilterItem from './FilterItem.svelte';
	import FilterChoises from './FilterChoises.svelte';
	import { elementToDisplay, get_KindsArray, get_NamesArray } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher } from 'svelte';
	import { loop_guard } from 'svelte/internal';

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
	export let chosenInputField;
	let inputEl;
	export let rawValue = '';
	export let dispatchValue = null;
	export let isINPUT_OBJECT = false;
	let checkboxChecked;
	$: rawValue = checkboxChecked;
	$: dispatchValue = checkboxChecked;

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

			console.log('chosenInputField', chosenInputField);
			console.log('detail', detail);
			isINPUT_OBJECT = detail.extraData.dd_displayType == 'INPUT_OBJECT';
			chosen = detail.chosen;
			let valueCouldBeValid = true;
			if (chosenInputField) {
				let rawValue_TypeOf = typeof rawValue;
				if (chosenInputField.dd_kindList) {
					if (!['string', 'number', 'date'].includes(rawValue_TypeOf)) {
						rawValue = '';
						valueCouldBeValid = false;
					} else {
						dispatchValue = rawValue.split('\n');
						dispatchValue = dispatchValue.map((elVal) => {
							return chosenInputField.dd_displayType == 'text' ? `'${elVal}'` : elVal || '';
						});
					}
				} else if (chosenInputField.dd_displayType == 'boolean') {
					if (typeof rawValue !== 'boolean') {
						rawValue = true;
						dispatchValue = true;
						checkboxChecked = true;
					} else {
					}
				} else if (chosenInputField.dd_displayType == 'geo') {
					//
				} else {
					if (!['string', 'number', 'date'].includes(rawValue_TypeOf)) {
						rawValue = '';
						valueCouldBeValid = false;
					} else {
						dispatchValue = chosenInputField.dd_displayType == 'text' ? `'${rawValue}'` : rawValue;
					}
				}
				checkboxChecked = rawValue;
				console.log('-----', rawValue);

				if (valueCouldBeValid) {
					dispatch('changed', {
						chd_chosen: detail.chosen,
						chd_dispatchValue: dispatchValue,
						chd_needsValue: true,
						chd_needsChosen: true,
						chd_rawValue: rawValue,
						chd_Choises: detail?.choises,
						isINPUT_OBJECT,
						chosenInputField
					}); //chd_ == chosen data
				}
			} else {
				// dispatch('changed', {
				// 	chd_chosen: detail.chosen,
				// 	chd_dispatchValue: dispatchValue,
				// 	chd_needsValue: false,
				// 	chd_needsChosen: true,
				// 	chd_Choises: detail?.choises,
				// 	isINPUT_OBJECT,
				// 	chosenInputField
				// }); //chd_ == chosen data
			}
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
					on:change={() => {
						rawValue = inputEl.value;
						dispatchValue = rawValue.split('\n');
						dispatchValue = dispatchValue.map((elVal) => {
							return chosenInputField.dd_displayType == 'text' ? `'${elVal}'` : elVal || '';
						});
						dispatch('changed', {
							chd_chosen: chosen,
							chd_dispatchValue: dispatchValue,
							chd_rawValue: rawValue,
							chd_needsValue: true,
							chd_needsChosen: true,
							isINPUT_OBJECT
						}); //chd_ == chosen data
					}}
				/>
			{:else if chosenInputField.dd_displayType == 'boolean'}
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label  w-40">
					<div class="flex">
						<input
							type="checkbox"
							class="toggle toggle-primary"
							bind:checked={checkboxChecked}
							on:change={() => {
								dispatch('changed', {
									chd_chosen: chosen,
									chd_dispatchValue:
										chosenInputField.dd_displayType == 'text' ? `'${rawValue}'` : rawValue,
									chd_rawValue: rawValue,
									chd_needsValue: true,
									chd_needsChosen: true,
									isINPUT_OBJECT
								}); //chd_ == chosen data
							}}
						/>
					</div>
				</label>
			{:else if chosenInputField.dd_displayType == 'geo'}
				<input
					type={chosenInputField.dd_displayType}
					class="input input-primary input-xs w-20 h-20 mr-2 "
					placeholder="map here"
					bind:this={inputEl}
					value={rawValue}
					on:change={() => {
						rawValue = inputEl.value;
						dispatch('changed', {
							chd_chosen: chosen,
							chd_dispatchValue:
								chosenInputField.dd_displayType == 'text' ? `'${rawValue}'` : rawValue || '',
							chd_rawValue: rawValue,

							chd_needsValue: true,
							chd_needsChosen: true,
							isINPUT_OBJECT
						}); //chd_ == chosen data
					}}
				/>
			{:else}
				<input
					type={chosenInputField.dd_displayType}
					class="input input-primary input-xs w-40 mr-2"
					bind:this={inputEl}
					value={rawValue}
					on:change={() => {
						rawValue = inputEl.value;
						dispatch('changed', {
							chd_chosen: chosen,
							chd_dispatchValue:
								chosenInputField.dd_displayType == 'text' ? `'${rawValue}'` : rawValue || '',
							chd_rawValue: rawValue,

							chd_needsValue: true,
							chd_needsChosen: true,
							isINPUT_OBJECT
						}); //chd_ == chosen data
					}}
				/>{/if}
		</label>
	{/if}
</div>
