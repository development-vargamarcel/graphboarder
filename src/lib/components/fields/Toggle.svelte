<script>
	import { createEventDispatcher } from 'svelte';

	export let dd_displayType;
	let inputEl;
	export let rawValue;
	const dispatch = createEventDispatcher();
</script>

<label class="flex w-full ">
	<input
		type="checkbox"
		class="toggle toggle-primary"
		bind:this={inputEl}
		checked={rawValue == 'true' || rawValue == true ? true : false}
		on:change={() => {
			rawValue = inputEl.checked ? true : false;
			dispatch('changed', {
				chd_dispatchValue: dd_displayType == 'text' ? `'${rawValue}'` : rawValue,
				chd_rawValue: rawValue,
				chd_needsValue: true,
				chd_needsChosen: false
			}); //chd_ == chosen data
		}}
	/>
	<p class="flex grow" />

	<p class={rawValue ? 'text-primary' : ''}>{rawValue}</p>
</label>
