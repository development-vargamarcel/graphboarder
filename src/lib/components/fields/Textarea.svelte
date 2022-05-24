<script>
	import { createEventDispatcher } from 'svelte';

	export let dd_displayType;
	let inputEl;
	let rawValue;
	let dispatchValue;
	const dispatch = createEventDispatcher();
</script>

<textarea
	type={dd_displayType}
	class="textarea textarea-primary textarea-xs"
	bind:this={inputEl}
	value={rawValue}
	on:keyup={() => {
		rawValue = inputEl.value;
		dispatchValue = rawValue.split('\n');
		dispatchValue = dispatchValue.map((elVal) => {
			return parseInt(elVal) ? elVal : `'${elVal}'`;
		});
		dispatch('changed', {
			chd_chosen: undefined,
			chd_dispatchValue: dispatchValue || '',
			chd_needsValue: true,
			chd_needsChosen: false
		}); //chd_ == chosen data
	}}
/>
