<script lang="ts">
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import { getContext } from 'svelte';
	import type { LayoutData } from './$types';
	const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	console.log({ schemaData, QMSMainWraperContext });
	$: queryFields = $schemaData.queryFields;
	export let data: LayoutData;
</script>

{#if schemaData}
	<QMSWraper QMS_info={queryFields[0]} prefix="">
		<slot />
	</QMSWraper>{/if}
