<script lang="ts">
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import type { QMSMainWraperContext } from '$lib/types/index';

	export const prefix = '';
	let { group } = $props();

	let mainWraperCtx = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const schemaData = mainWraperCtx?.schemaData;
	let showDescription = $state();
</script>

{#if !group.group_isRoot}
	<div class="text-sm">
		{group.group_name}
	</div>
{/if}
<div class="text-xs ml-2 pt-1">
	{#if group.dd_kindList}
		( list )
	{/if}
	{#if getRootType(null, group.dd_rootName, schemaData)?.dd_baseFilterOperators}
		{`( ${getRootType(null, group.dd_rootName, schemaData)?.dd_baseFilterOperators?.join(',')} )`}
	{/if}
</div>

{#if group.group_name !== 'root'}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<i
		class="bi bi-info-circle text-secondary px-2"
		title={group.description}
		onclick={() => {
			if (showDescription == group.description) {
				showDescription = '';
			} else {
				showDescription = group.description;
			}
		}}
	></i>
	{#if showDescription == group.description && group.description}
		<p class="text-xs font-light text-secondary select-none">
			({group.description})
		</p>
	{/if}
{/if}
