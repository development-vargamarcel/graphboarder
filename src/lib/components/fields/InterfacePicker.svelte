<script lang="ts">
	import { getContext } from 'svelte';
	import FilterItem from '$lib/components/FilterItem.svelte';
	import { getRootType } from '$lib/utils/usefulFunctions';
	interface Props {
		prefix?: string;
		chosen: any;
		typeInfo: any;
		onInterfaceChosen?: (detail: { chosen: string }) => void;
	}

	let { prefix = '', chosen, typeInfo, onInterfaceChosen }: Props = $props();
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

<div class="w-full"></div>
<FilterItem
	title="pick an interface"
	choises={possible_displayInterfaces.filter((displayInterface) => {
		return displayInterface;
	})}
	{chosen}
	onFilterApplied={(detail) => {
		onInterfaceChosen?.({ chosen: detail.chosen });
		console.log(detail);
	}}
>
	{rootType.dd_displayName}
</FilterItem>
