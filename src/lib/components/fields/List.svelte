<script>
	import { createEventDispatcher } from 'svelte';
	import Interface from './Interface.svelte';

	export let dd_displayType;
	let inputEl;
	export let rawValue = [];
	export let dispatchValue = [];
	export let dd_displayStructure;
	console.log({ dd_displayType });
	const dispatch = createEventDispatcher();

	let elements = rawValue.map((el) => {
		return { chd_rawValue: el };
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

<div class="flex flex-col w-full space-y-2">
	{#each elements as element}
		<div class="flex">
			<Interface
				{dd_displayType}
				rawValue={element.chd_rawValue}
				{dispatchValue}
				{dd_displayStructure}
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
	<button class="btn btn-sm btn-primary w-full" on:click={add}>add</button>
</div>

<!-- <textarea
	type={dd_displayType}
	class="textarea textarea-primary w-full"
	bind:this={inputEl}
	value={rawValue}
	on:change={() => {
		rawValue = inputEl.value;
		dispatchValue = rawValue.split('\n');
		dispatchValue = dispatchValue.map((elVal) => {
			return dd_displayType == 'text' ? `'${elVal}'` : elVal || '';
		});
		dispatch('changed', {
			chd_chosen: undefined,
			chd_dispatchValue: dispatchValue || '',
			chd_needsValue: true,
			chd_needsChosen: false,
			chd_rawValue: rawValue
		}); //chd_ == chosen data
	}}
/> -->
