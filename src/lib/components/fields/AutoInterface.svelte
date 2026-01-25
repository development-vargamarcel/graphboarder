<script lang="ts">
	//this automatically dispalys the correct interface based on typeInfo
	import InterfaceList from '$lib/components/fields/InterfaceList.svelte';
	import Interface from '$lib/components/fields/Interface.svelte';
	import { getContext } from 'svelte';
	import { getPreciseType } from '$lib/utils/usefulFunctions';
    import type { Writable } from 'svelte/store';

	let { typeInfo, alwaysOn_interfacePicker = false, onChanged } = $props();
	const choosenDisplayInterface = getContext<Writable<string>>('choosenDisplayInterface');
	const expectsInterfaceList = $derived(typeInfo.dd_kindList && $choosenDisplayInterface != 'ENUM');
	let rawValue =
		$derived(expectsInterfaceList && getPreciseType(typeInfo?.chd_rawValue) != 'array'
			? [typeInfo?.chd_rawValue]
			: typeInfo?.chd_rawValue);
	let dispatchValue = $derived(typeInfo?.chd_dispatchValue);
</script>

{#if expectsInterfaceList}
	<InterfaceList {alwaysOn_interfacePicker} {typeInfo} {rawValue} {dispatchValue} {onChanged} />
{:else}
	<Interface {alwaysOn_interfacePicker} {typeInfo} {rawValue} {dispatchValue} {onChanged} />
{/if}
