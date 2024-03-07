<script>
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	export let setNotInUseIfNotValid = true;
	export let setNotInUseIfNotValidAndENUM = true;
	export let parentNode;
	export let node;
	export let prefix = '';
	export let QMSInfo;
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	const nodeRootType = getRootType(null, QMSInfo.dd_rootName, schemaData);
	const description = `${QMSInfo?.description || ''} ${nodeRootType?.description || ''}`.trim();
</script>

{#if description}
	<div class="alert alert-info shadow-lg py-2">
		<div class="flex">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current flex-shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<div>{description}</div>
		</div>
	</div>
{/if}
