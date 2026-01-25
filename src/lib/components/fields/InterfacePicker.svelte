<script lang="ts">
	import { getContext } from 'svelte';
	import FilterItem from '$lib/components/FilterItem.svelte';
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { Logger } from '$lib/utils/logger';
    import type { QMSMainWraperContext } from '$lib/types/index';

	interface Props {
		prefix?: string;
		chosen: any;
		typeInfo: any;
		onInterfaceChosen?: (detail: { chosen: string }) => void;
	}

	let { prefix = '', chosen, typeInfo, onInterfaceChosen }: Props = $props();
	let mainWraperCtx = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = mainWraperCtx?.endpointInfo;
	let possible_displayInterfaces = $derived($endpointInfo.typesExtraDataPossibilities.map(
		(possibility: any) => {
			return possibility.get_Val()?.displayInterface;
		}
	));
	const schemaData = mainWraperCtx?.schemaData;
	let rootType = $derived(getRootType(null, typeInfo.dd_rootName, schemaData));
</script>

<div class="w-full"></div>
<FilterItem
	title="pick an interface"
	choises={possible_displayInterfaces.filter((displayInterface: any) => {
		return displayInterface;
	})}
	{chosen}
	onFilterApplied={(detail) => {
		onInterfaceChosen?.({ chosen: detail.chosen });
		Logger.debug(detail);
	}}
>
	{rootType?.dd_displayName}
</FilterItem>
