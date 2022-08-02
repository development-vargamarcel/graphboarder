<script>
	import { createEventDispatcher } from 'svelte';

	export let dd_displayType;
	let inputEl;
	export let rawValue = '';

	export let dispatchValue = '';
	export let dd_displayStructure;

	const dispatch = createEventDispatcher();
</script>

<textarea
	type={dd_displayType}
	class="textarea textarea-primary w-full"
	bind:this={inputEl}
	value={rawValue}
	on:change={() => {
		rawValue = inputEl.value;
		dispatchValue = rawValue.split('\n');
		dispatchValue = dispatchValue.map((elVal) => {
			return dd_displayType == 'text' ? `'${elVal}'` : elVal || '';
		});
		dispatch('changed', {
			chd_chosen: undefined,
			chd_dispatchValue: dispatchValue || '',
			chd_needsValue: true,
			chd_needsChosen: false,
			chd_rawValue: rawValue
		}); //chd_ == chosen data
	}}
/>
