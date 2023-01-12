<script>
	import { convertTo_displayStructure } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher } from 'svelte';

	export let dd_displayInterface;
	export let dd_displayStructure;
	let inputEl;
	export let rawValue;
	const dispatch = createEventDispatcher();
	console.log({ dd_displayInterface });
	console.log(dd_displayStructure);

	//let castAs //most of the times as string
</script>

<input
	type={dd_displayInterface}
	class="input input-primary input-xs  w-full  mr-2 "
	bind:this={inputEl}
	value={rawValue}
	on:change={() => {
		rawValue = inputEl.value;
		console.log(convertTo_displayStructure(dd_displayStructure, rawValue));
		if (dd_displayInterface == 'number' && rawValue == '') {
			rawValue = undefined;
		}
		let chd_dispatchValue =
			dd_displayInterface == 'text' || dd_displayInterface == undefined
				? `'${rawValue}'`
				: rawValue;
		if (dd_displayStructure) {
			chd_dispatchValue = convertTo_displayStructure(dd_displayStructure, rawValue);
		}
		dispatch('changed', {
			chd_chosen: undefined,
			chd_dispatchValue,

			chd_needsValue: true,
			chd_needsChosen: false,
			chd_rawValue: rawValue
		}); //chd_ == chosen data sdasd ss
	}}
/>
