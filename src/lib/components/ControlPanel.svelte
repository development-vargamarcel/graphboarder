<script>
	import { getContext, setContext } from 'svelte';

	import ControlPanelItem from './ControlPanelItem.svelte';
	export let type;
	export let prefix = '';
	export let column_stepsOfFields;
	export let addColumnFromInput;
	export let dd_relatedRoot;
	export let QMSName;
	export let currentQMS_info;
	const QMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { mergedChildren_controlPanel_Store } = QMSWraperContext;

	let showControlPanel = false;
	const controlPanelContext = {};
	setContext(`${prefix}controlPanelContext`, controlPanelContext);
</script>

<button
	class="btn btn-xs w-full"
	on:click={() => {
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
