<script>
	import { createEventDispatcher, getContext } from 'svelte';
	import FilterItem from '$lib/components/FilterItem.svelte';
	import { getRootType } from '$lib/utils/usefulFunctions';
	const dispatch = createEventDispatcher();
	export let prefix = '';
	export let chosen;
	export let typeInfo;
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const possible_displayInterfaces = $endpointInfo.typesExtraDataPossibilities.map(
		(possibility) => {
			return possibility.get_Val()?.displayInterface;
		}
	);
	const schemaData = QMSMainWraperContext?.schemaData;
	const rootType = getRootType(null, typeInfo.dd_rootName, schemaData);
</script>

<div class="w-full" />
<FilterItem
	title="pick an interface"
	choises={possible_displayInterfaces.filter((displayInterface) => {
		return displayInterface;
	})}
	{chosen}
	on:filterApplied={(e) => {
		dispatch('interfaceChosen', { chosen: e.detail.chosen });
		console.log(e.detail);
	}}
>
	{rootType.dd_displayName}
</FilterItem>
