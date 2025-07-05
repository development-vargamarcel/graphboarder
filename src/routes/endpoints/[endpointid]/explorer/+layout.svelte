<script lang="ts">
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import { getContext } from 'svelte';
	import type { LayoutData } from './$types';
	const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	console.log({ schemaData, QMSMainWraperContext });
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
