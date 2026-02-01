<script lang="ts">
	import Interface from '$lib/components/fields/Interface.svelte';
	import { Logger } from '$lib/utils/logger';

	let inputEl;
	let {
		rawValue = [],
		dispatchValue = [],
		typeInfo,
		onChanged,
		alwaysOn_interfacePicker = false
	} = $props();

	let elements = $state([]);
	$effect(() => {
		elements = rawValue.map((el, i) => {
			return { chd_rawValue: el, chd_dispatchValue: dispatchValue[i] };
		});
		Logger.debug(elements);
	});
	const add = () => {
		elements.push({ chd_rawValue: null });
		elements = elements;
		Logger.debug(elements);
	};
	const del = (chd_rawValue) => {
		//chd_rawValue will be the identifier  //!!! as side effect, if multiple elements share the same chd_rawValue, they will all be deleted
		elements = elements.filter((el) => {
			return el.chd_rawValue !== chd_rawValue;
		});
		dispatchChanges();
		Logger.debug(elements);
	};
	const changedElement = (e) => {
		Logger.debug(elements);
		dispatchChanges();
	};
	const dispatchChanges = () => {
		let chd_dispatchValue = elements.map((el) => {
			return el.chd_dispatchValue;
		});
		let chd_rawValue = elements.map((el) => {
			return el.chd_rawValue;
		});
		onChanged?.({
			chd_dispatchValue,
			chd_rawValue
		});
	};
</script>

<div class="flex flex-col w-full space-y-2 pr-1">
	{#each elements as element}
		<div class="flex">
			<Interface
				{alwaysOn_interfacePicker}
				{typeInfo}
				rawValue={element.chd_rawValue}
				dispatchValue={element.chd_dispatchValue}
				onChanged={(detail) => {
					Object.assign(element, detail);
					changedElement(detail);
				}}
			/>
			<button
				class="btn btn-xs btn-danger"
				aria-label="delete"
				onclick={(e) => {
					// element.chd_rawValue=element
					del(element.chd_rawValue);
				}}><i class="bi bi-trash3-fill"></i></button
			>
		</div>
	{/each}
	<button class="btn btn-xs btn-primary w-full" onclick={add}>add</button>
</div>
