<script>
	import { createEventDispatcher } from 'svelte';
	import Interface from '$lib/components/fields/Interface.svelte';

	let inputEl;
	export let rawValue = [];
	export let dispatchValue = [];
	export let typeInfo;

	const dispatch = createEventDispatcher();

	let elements = rawValue.map((el, i) => {
		return { chd_rawValue: el, chd_dispatchValue: dispatchValue[i] };
	});
	console.log(elements);
	const add = () => {
		elements.push({ chd_rawValue: null });
		elements = elements;
		console.log(elements);
	};
	const del = (chd_rawValue) => {
		//chd_rawValue will be the identifier  //!!! as side effect, if multiple elements share the same chd_rawValue, they will all be deleted
		elements = elements.filter((el) => {
			return el.chd_rawValue !== chd_rawValue;
		});
		dispatchChanges();
		console.log(elements);
	};
	const changedElement = (e) => {
		console.log(elements);
		dispatchChanges();
	};
	const dispatchChanges = () => {
		let chd_dispatchValue = elements.map((el) => {
			return el.chd_dispatchValue;
		});
		let chd_rawValue = elements.map((el) => {
			return el.chd_rawValue;
		});
		dispatch('changed', {
			chd_chosen: undefined,
			chd_dispatchValue,
			chd_needsValue: true,
			chd_needsChosen: false,
			chd_rawValue
		});
	};
</script>

<div class="flex flex-col w-full space-y-2 pr-1">
	{#each elements as element}
		<div class="flex">
			<Interface
				{typeInfo}
				rawValue={element.chd_rawValue}
				{dispatchValue}
				on:changed={(e) => {
					Object.assign(element, e.detail);
					changedElement(e);
				}}
			/>
			<button
				class="btn btn-xs btn-danger"
				on:click={(e) => {
					// element.chd_rawValue=element
					del(element.chd_rawValue);
				}}><i class="bi bi-trash3-fill" /></button
			>
		</div>
	{/each}
	<button class="btn btn-xs btn-primary w-full" on:click={add}>add</button>
</div>
