<script lang="ts">
	import { getContext } from 'svelte';
	import { Logger } from '$lib/utils/logger';

	interface Props {
		type: any;
		i: any;
		prefix?: string;
	}

	let { type, i, prefix = '' }: Props = $props();

	const QMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
</script>

<tr>
	<th>{i + 1}</th>
	<td
		class="cursor-pointer hover:text-primary"
		onclick={() => {
			Logger.debug(type);
		}}
	>
		{type.dd_displayName}</td
	>
	<td
		class="cursor-pointer hover:text-primary"
		onclick={() => {
			Logger.debug(schemaData.get_rootType(null, type.dd_rootName, schemaData));
		}}>{type.dd_rootName}</td
	>
	<td>{type.dd_kindList_NON_NULL ? '!' : ''}</td>
	<td>{type.dd_kindList ? 'list' : ''}</td>
	<td>{type.dd_kindEl_NON_NULL ? '!' : ''}</td>
	<td>{type.dd_kindEl}</td>
</tr>
