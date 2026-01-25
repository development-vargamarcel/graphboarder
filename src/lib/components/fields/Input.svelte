<script lang="ts">
	import {
		string_transformer,
		string_transformerREVERSE
	} from '$lib/utils/dataStructureTransformers';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { Logger } from '$lib/utils/logger';

	/**
	 * Props for the Input component.
	 */
	interface Props {
		/**
		 * The HTML input type (e.g., 'text', 'number').
		 */
		displayInterface: string;
		/**
		 * The current value of the input. Bindable.
		 */
		rawValue?: any;
		/**
		 * The value to display if rawValue is undefined initially.
		 */
		dispatchValue?: any;
		/**
		 * Callback fired when the input value changes.
		 */
		onChanged?: (detail: { chd_rawValue: any }) => void;
	}

	let {
		displayInterface,
		rawValue = $bindable(),
		dispatchValue,
		onChanged
	}: Props = $props();

	let inputEl = $state<HTMLInputElement>();
	const mutationVersion = getContext<Writable<boolean>>('mutationVersion');

	$effect(() => {
		if (!rawValue && dispatchValue) {
			if (displayInterface != 'number') {
				rawValue = dispatchValue;
			} else {
				rawValue = string_transformerREVERSE(dispatchValue, false);
			}
		}
		Logger.debug('rawValue', rawValue, 'chd_dispatchValue', dispatchValue);
	});

	//let castAs //most of the times as string
</script>

<input
	type={displayInterface}
	class="input input-primary  {$mutationVersion ? 'input-md' : 'input-xs'} mb-[1px] w-full  mr-2 "
	bind:this={inputEl}
	value={rawValue}
	onchange={() => {
		rawValue = inputEl!.value;

		if (displayInterface == 'number' && rawValue == '') {
			rawValue = undefined;
		}

		onChanged?.({
			chd_rawValue: rawValue
			// chd_dispatchValue:
			// 	displayInterface == 'number' ? rawValue : string_transformer(rawValue, false)
		}); //chd_ == chosen data sdasd ss
	}}
/>
