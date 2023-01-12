<script>
	import { createEventDispatcher } from 'svelte';

	export let displayInterface;
	let inputEl;
	export let rawValue = true;

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
				chd_rawValue: rawValue,
				chd_needsValue: true,
				chd_needsChosen: false
			});
		}}
	/>
	<p class="flex grow" />

	<p class={rawValue ? 'text-primary' : ''}>{rawValue}</p>
</label>
