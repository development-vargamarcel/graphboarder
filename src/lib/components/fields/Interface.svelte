<script>
	import Input from '$lib/components/fields/Input.svelte';
	import Map from '$lib/components/fields/Map.svelte';
	import Toggle from '$lib/components/fields/Toggle.svelte';
	import { endpointInfo } from '$lib/stores/endpointInfo/endpointInfo';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let rawValue;
	export let typeInfo;
	const { displayInterface, get_convertedValue } = endpointInfo.get_typeExtraData(typeInfo);
	let componentToRender = Input;
	if (['text', 'number', 'date', 'datetime-local'].includes(displayInterface)) {
		componentToRender = Input;
	}
	if (['geo'].includes(displayInterface)) {
		componentToRender = Map;
	}
	if (['boolean'].includes(displayInterface)) {
		componentToRender = Toggle;
	}
</script>

<svelte:component
	this={componentToRender}
	{displayInterface}
	{rawValue}
	on:changed={(e) => {
		let { detail } = e;
		detail.chd_dispatchValue = get_convertedValue(detail.chd_rawValue);
		dispatch('changed', detail);
	}}
/>
