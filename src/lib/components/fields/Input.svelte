<script>
	import {
		string_transformer,
		string_transformerREVERSE
	} from '$lib/utils/dataStructureTransformers';
	import { createEventDispatcher, getContext } from 'svelte';

	let inputEl = $state();
	/** @type {{displayInterface: any, rawValue: any, dispatchValue: any}} */
	let { displayInterface, rawValue = $bindable(), dispatchValue } = $props();
	if (!rawValue && dispatchValue) {
		if (displayInterface != 'number') {
			rawValue = dispatchValue;
		} else {
			rawValue = string_transformerREVERSE(dispatchValue, false);
		}
	}
	console.log('rawValue', rawValue, 'chd_dispatchValue', dispatchValue);
	const dispatch = createEventDispatcher();

	//let castAs //most of the times as string
	const mutationVersion = getContext('mutationVersion');
</script>

<input
	type={displayInterface}
	class="input input-primary  {$mutationVersion ? 'input-md' : 'input-xs'} mb-[1px] w-full  mr-2 "
	bind:this={inputEl}
	value={rawValue}
	onchange={() => {
		rawValue = inputEl.value;

		if (displayInterface == 'number' && rawValue == '') {
			rawValue = undefined;
		}

		dispatch('changed', {
			chd_rawValue: rawValue
			// chd_dispatchValue:
			// 	displayInterface == 'number' ? rawValue : string_transformer(rawValue, false)
		}); //chd_ == chosen data sdasd ss
	}}
/>
