<script lang="ts">
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	interface Props {
		setNotInUseIfNotValid?: boolean;
		setNotInUseIfNotValidAndENUM?: boolean;
		parentNode: any;
		node: any;
		prefix?: string;
		QMSInfo: any;
	}

	let {
		setNotInUseIfNotValid = true,
		setNotInUseIfNotValidAndENUM = true,
		parentNode,
		node,
		prefix = '',
		QMSInfo
	}: Props = $props();
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	const nodeRootType = getRootType(null, QMSInfo.dd_rootName, schemaData);
	const descriptionNeedsSeparator = QMSInfo?.description && nodeRootType?.description;
</script>

{#if nodeRootType?.description || QMSInfo?.description}
	<div class="alert alert-info shadow-lg py-2 mt-2 text-md  ">
		<div class="flex space-x-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current flex-shrink-0 w-6 h-6 my-auto"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<ul class=" space-y-2">
				{#if nodeRootType?.description}
					<li class="">
						{nodeRootType?.description}
					</li>
				{/if}

				{#if QMSInfo?.description}
					<li class="">{QMSInfo?.description}</li>
				{/if}
			</ul>
		</div>
	</div>
{/if}
