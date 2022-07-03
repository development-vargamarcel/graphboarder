<script>
	import { createEventDispatcher } from 'svelte';

	export let dd_displayType;
	let inputEl;
	export let rawValue;
	const dispatch = createEventDispatcher();
</script>

<input
	type={dd_displayType}
	class="input input-primary input-xs  w-full  mr-2 "
	bind:this={inputEl}
	value={rawValue}
	on:change={() => {
		rawValue = inputEl.value;
		if (dd_displayType == 'number' && rawValue == '') {
			rawValue = undefined;
		}

		dispatch('changed', {
			chd_chosen: undefined,
			chd_dispatchValue: dd_displayType == 'text' ? `'${rawValue}'` : rawValue,
			chd_needsValue: true,
			chd_needsChosen: false,
			chd_rawValue: rawValue
		}); //chd_ == chosen data sdasd ss
	}}
/>
