<script lang="ts">
	import { getContext } from 'svelte';
	import FilterItem from '$lib/components/FilterItem.svelte';
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { Logger } from '$lib/utils/logger';
	interface Props {
		prefix?: string;
		chosen: any;
		typeInfo: any;
		onInterfaceChosen?: (detail: { chosen: string }) => void;
	}

	import type { QMSMainWraperContext } from '$lib/types/index';
	import { get } from 'svelte/store';

	let { prefix = '', chosen, typeInfo, onInterfaceChosen }: Props = $props();
	let QMSMainWraperContext_Value = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext_Value?.endpointInfo;
	const possible_displayInterfaces = $derived($endpointInfo.typesExtraDataPossibilities.map(
		(possibility) => {
			return possibility.get_Val()?.displayInterface;
		}
	));
	const schemaData = QMSMainWraperContext_Value?.schemaData;
	const rootType = $derived(getRootType(null, typeInfo.dd_rootName, get(schemaData)));
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
		Logger.debug(detail);
	}}
>
	{rootType.dd_displayName}
</FilterItem>
