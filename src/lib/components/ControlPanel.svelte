<script lang="ts">
	import { getContext, setContext, untrack } from 'svelte';

	import ControlPanelItem from './ControlPanelItem.svelte';
	import type { QMSWraperContext } from '$lib/types/index';

	interface Props {
		type?: any;
		prefix?: string;
		column_stepsOfFields?: any;
		addColumnFromInput?: any;
		dd_relatedRoot?: any;
		QMSName?: any;
		currentQMS_info?: any;
		hasGroup_argsNode?: boolean;
	}

	let {
		type,
		prefix = '',
		column_stepsOfFields,
		addColumnFromInput,
		dd_relatedRoot,
		QMSName,
		currentQMS_info,
		hasGroup_argsNode
	}: Props = $props();

	const qmsWraperCtx = getContext<QMSWraperContext>(
		`${untrack(() => prefix)}OutermostQMSWraperContext`
	);
	const mergedChildren_controlPanel_Store = qmsWraperCtx?.mergedChildren_controlPanel_Store;

	let showControlPanel = $state(false);
	const controlPanelContext = {};
	setContext(`${untrack(() => prefix)}controlPanelContext`, controlPanelContext);
</script>

<button
	class="btn btn-xs w-full"
	onclick={() => {
		showControlPanel = !showControlPanel;
	}}
>
	toggle control panel
</button>
{#if showControlPanel}
	<div class="card w-full pr-4 md:pr-0">
		<div
			class="card-body p-0 pt-2 {$mergedChildren_controlPanel_Store.length > 0
				? 'h-60'
				: ''}  overflow-y-auto resize"
		>
			{#each $mergedChildren_controlPanel_Store as CPItem}
				<ControlPanelItem {CPItem} />
			{/each}
		</div>
	</div>
{/if}
