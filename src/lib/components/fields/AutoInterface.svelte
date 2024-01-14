<script>
	//this automatically dispalys the correct interface based on typeInfo
	import InterfaceList from '$lib/components/fields/InterfaceList.svelte';
	import Interface from '$lib/components/fields/Interface.svelte';
	export let typeInfo;
	$: rawValue = typeInfo?.chd_rawValue;
	$: dispatchValue = typeInfo?.chd_dispatchValue;
</script>

{#if typeInfo.dd_kindList && typeInfo.dd_displayInterface != 'ENUM'}
	<InterfaceList
		{typeInfo}
		dd_displayInterface={typeInfo.dd_displayInterface}
		{rawValue}
		{dispatchValue}
		on:changed
	/>
{:else}
	<Interface
		{typeInfo}
		dd_displayInterface={typeInfo.dd_displayInterface}
		{rawValue}
		{dispatchValue}
		on:changed
	/>
{/if}
