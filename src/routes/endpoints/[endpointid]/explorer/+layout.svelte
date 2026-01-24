<script lang="ts">
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import { getContext } from 'svelte';
	import type { LayoutData } from './$types';
	import { Logger } from '$lib/utils/logger';
	import type { QMSMainWraperContext } from '$lib/types/index';

	const prefix = '';
	let mainWraperContext = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = mainWraperContext?.endpointInfo;
	const schemaData = mainWraperContext?.schemaData;
	Logger.debug({ schemaData, mainWraperContext });
	let queryFields = $derived($schemaData.queryFields);
	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

{#if schemaData}
	<QMSWraper QMS_info={queryFields[0]} prefix="" extraInfo={{ isForExplorer: true }}>
		{@render children?.()}
	</QMSWraper>{/if}
