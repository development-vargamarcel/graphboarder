<script>
	//this automatically dispalys the correct interface based on typeInfo
	import InterfaceList from '$lib/components/fields/InterfaceList.svelte';
	import Interface from '$lib/components/fields/Interface.svelte';
	export let typeInfo;
	export let alwaysOn_interfacePicker;
	$: rawValue = typeInfo?.chd_rawValue;
	$: dispatchValue = typeInfo?.chd_dispatchValue;
	$: displayInterface = typeInfo?.displayInterface;
</script>

{#if typeInfo.dd_kindList && typeInfo.dd_displayInterface != 'ENUM'}
	<InterfaceList
		{alwaysOn_interfacePicker}
		{typeInfo}
		{displayInterface}
		{rawValue}
		{dispatchValue}
		on:changed
	/>
{:else}
	<Interface
		{alwaysOn_interfacePicker}
		{typeInfo}
		{displayInterface}
		{rawValue}
		{dispatchValue}
		on:changed
	/>
{/if}
