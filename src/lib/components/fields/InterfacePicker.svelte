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

	let { prefix = '', chosen, typeInfo, onInterfaceChosen }: Props = $props();
	let QMSMainWraperContext_IP = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext_IP?.endpointInfo;
	let possible_displayInterfaces = $derived($endpointInfo.typesExtraDataPossibilities.map(
		(possibility: any) => {
			return possibility.get_Val()?.displayInterface;
		}
	));
	const schemaData = QMSMainWraperContext?.schemaData;
	let rootType = $derived(getRootType(null, typeInfo.dd_rootName, schemaData));
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
