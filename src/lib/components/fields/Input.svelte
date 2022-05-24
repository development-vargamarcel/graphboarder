<script>
	import { createEventDispatcher } from 'svelte';

	export let dd_displayType;
	let inputEl;
	export let rawValue;
	const dispatch = createEventDispatcher();
</script>

<input
	type={dd_displayType}
	class="input input-primary input-xs w-40 mr-2"
	bind:this={inputEl}
	value={rawValue}
	on:change={() => {
		rawValue = inputEl.value;
		dispatch('changed', {
			chd_chosen: undefined,
			chd_dispatchValue: parseInt(rawValue) ? rawValue : `'${rawValue}'` || '',
			chd_needsValue: true,
			chd_needsChosen: false,
			chd_rawValue: rawValue
		}); //chd_ == chosen data
	}}
/>
