<script>
	import Input from '$lib/components/fields/Input.svelte';
	import Map from '$lib/components/fields/Map.svelte';
	import Toggle from '$lib/components/fields/Toggle.svelte';

	export let dd_displayInterface;
	export let dd_displayStructure;
	export let rawValue;
	export let typeInfo;

	let componentToRender = Input;
	if (['text', 'number', 'date', 'datetime-local'].includes(dd_displayInterface)) {
		componentToRender = Input;
	}
	if (['geo'].includes(dd_displayInterface)) {
		componentToRender = Map;
	}
	if (['boolean'].includes(dd_displayInterface)) {
		componentToRender = Toggle;
	}
</script>

<svelte:component
	this={componentToRender}
	{dd_displayInterface}
	{dd_displayStructure}
	{rawValue}
	on:changed
/>
