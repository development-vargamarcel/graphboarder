<script>
	import Input from './Input.svelte';
	import Map from './Map.svelte';
	import Toggle from './Toggle.svelte';

	export let dd_displayType;
	export let dd_displayStructure;
	export let rawValue;
	let componentToRender = Input;
</script>

<svelte:component
	this={componentToRender}
	{dd_displayType}
	{dd_displayStructure}
	{rawValue}
	on:changed
/>
