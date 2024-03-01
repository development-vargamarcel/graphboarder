<script>
	//this automatically dispalys the correct interface based on typeInfo
	import InterfaceList from '$lib/components/fields/InterfaceList.svelte';
	import Interface from '$lib/components/fields/Interface.svelte';
	import { getContext } from 'svelte';
	import { getPreciseType } from '$lib/utils/usefulFunctions';
	export let typeInfo;
	export let alwaysOn_interfacePicker;
	const choosenDisplayInterface = getContext('choosenDisplayInterface');
	const expectsInterfaceList = typeInfo.dd_kindList && $choosenDisplayInterface != 'ENUM';
	$: rawValue =
		expectsInterfaceList && getPreciseType(typeInfo?.chd_rawValue) != 'array'
			? [typeInfo?.chd_rawValue]
			: typeInfo?.chd_rawValue;
	$: dispatchValue = typeInfo?.chd_dispatchValue;
</script>

{#if expectsInterfaceList}
	<InterfaceList {alwaysOn_interfacePicker} {typeInfo} {rawValue} {dispatchValue} on:changed />
{:else}
	<Interface {alwaysOn_interfacePicker} {typeInfo} {rawValue} {dispatchValue} on:changed />
{/if}
