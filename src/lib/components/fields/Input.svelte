<script>
	import { createEventDispatcher } from 'svelte';

	export let displayInterface;
	let inputEl;
	export let rawValue;
	const dispatch = createEventDispatcher();

	//let castAs //most of the times as string
</script>

<input
	type={displayInterface}
	class="input input-primary input-xs mb-[1px] w-full  mr-2 "
	bind:this={inputEl}
	value={rawValue}
	on:change={() => {
		rawValue = inputEl.value;

		if (displayInterface == 'number' && rawValue == '') {
			rawValue = undefined;
		}

		dispatch('changed', {
			chd_chosen: undefined,
			chd_needsValue: true,
			chd_needsChosen: false,
			chd_rawValue: rawValue
		}); //chd_ == chosen data sdasd ss
	}}
/>
