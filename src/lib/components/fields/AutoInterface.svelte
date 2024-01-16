<script>
	//this automatically dispalys the correct interface based on typeInfo
	import InterfaceList from '$lib/components/fields/InterfaceList.svelte';
	import Interface from '$lib/components/fields/Interface.svelte';
	import { getContext } from 'svelte';
	export let typeInfo;
	export let alwaysOn_interfacePicker;
	$: rawValue = typeInfo?.chd_rawValue;
	$: dispatchValue = typeInfo?.chd_dispatchValue;
	const choosenDisplayInterface = getContext('choosenDisplayInterface');
</script>

{#if typeInfo.dd_kindList && $choosenDisplayInterface != 'ENUM'}
	<InterfaceList {alwaysOn_interfacePicker} {typeInfo} {rawValue} {dispatchValue} on:changed />
{:else}
	<Interface {alwaysOn_interfacePicker} {typeInfo} {rawValue} {dispatchValue} on:changed />
{/if}
