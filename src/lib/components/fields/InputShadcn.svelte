<script lang="ts">
	import {
		string_transformer,
		string_transformerREVERSE
	} from '$lib/utils/dataStructureTransformers';
	import { getContext } from 'svelte';
	import { Input } from "$lib/components/ui/input";

	interface Props {
		displayInterface: any;
		rawValue?: any;
		dispatchValue?: any;
		onChanged?: (detail: any) => void;
	}

	let inputEl = $state<HTMLInputElement>();
	let { displayInterface, rawValue = $bindable(), dispatchValue, onChanged } = $props<Props>();

	if (!rawValue && dispatchValue) {
		if (displayInterface != 'number') {
			rawValue = dispatchValue;
		} else {
			rawValue = string_transformerREVERSE(dispatchValue, false);
		}
	}

	const mutationVersion = getContext('mutationVersion');

	// Handle change events
	const handleChange = () => {
		if (displayInterface == 'number' && rawValue == '') {
			rawValue = undefined;
		}

		onChanged?.({
			chd_rawValue: rawValue
		});
	};
</script>

<Input
	type={displayInterface}
	class="{$mutationVersion ? 'h-10' : 'h-8 text-sm'} mb-[1px] mr-2"
	bind:this={inputEl}
	bind:value={rawValue}
	onchange={handleChange}
/>
