<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import { Logger } from '$lib/utils/logger';

	interface Props {
		type: any;
		i: any;
		prefix?: string;
	}

	import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';

	let { type, i, prefix = '' }: Props = $props();

    const initialPrefix = untrack(() => prefix);
	// Initialization after props
	const qmsContext = getContext<QMSWraperContext>(`${untrack(() => prefix)}QMSWraperContext`);
	let context = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	const schemaData = context?.schemaData;
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
			Logger.debug((schemaData as any).get_rootType(null, type.dd_rootName, schemaData));
		}}>{type.dd_rootName}</td
	>
	<td>{type.dd_kindList_NON_NULL ? '!' : ''}</td>
	<td>{type.dd_kindList ? 'list' : ''}</td>
	<td>{type.dd_kindEl_NON_NULL ? '!' : ''}</td>
	<td>{type.dd_kindEl}</td>
</tr>
