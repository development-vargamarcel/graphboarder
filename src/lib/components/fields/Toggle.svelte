<script>
	import { createEventDispatcher } from 'svelte';

	export let dd_displayInterface;
	let inputEl;
	export let rawValue = true;
	export let dd_displayStructure;

	const dispatch = createEventDispatcher();
</script>

<label class="flex w-full ">
	<input
		type="checkbox"
		class="toggle toggle-primary"
		bind:this={inputEl}
		bind:checked={rawValue}
		on:change={() => {
			rawValue = inputEl.checked ? true : false;
			dispatch('changed', {
				chd_dispatchValue: dd_displayInterface == 'text' ? `'${rawValue}'` : rawValue,
				chd_rawValue: rawValue,
				chd_needsValue: true,
				chd_needsChosen: false
			}); //chd_ == chosen data
		}}
	/>
	<p class="flex grow" />

	<p class={rawValue ? 'text-primary' : ''}>{rawValue}</p>
</label>
