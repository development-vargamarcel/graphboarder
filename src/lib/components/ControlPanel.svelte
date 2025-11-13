<script lang="ts">
	import { getContext, setContext } from 'svelte';

	import ControlPanelItem from './ControlPanelItem.svelte';
	interface Props {
		type: any;
		prefix?: string;
		column_stepsOfFields: any;
		addColumnFromInput: any;
		dd_relatedRoot: any;
		QMSName: any;
		currentQMS_info: any;
	}

	let {
		type,
		prefix = '',
		column_stepsOfFields,
		addColumnFromInput,
		dd_relatedRoot,
		QMSName,
		currentQMS_info
	}: Props = $props();
	const QMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { mergedChildren_controlPanel_Store } = QMSWraperContext;

	let showControlPanel = $state(false);
	const controlPanelContext = {};
	setContext(`${prefix}controlPanelContext`, controlPanelContext);
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
