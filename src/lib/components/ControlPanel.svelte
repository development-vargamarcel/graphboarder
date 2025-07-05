<script>
	import { getContext, setContext } from 'svelte';

	import ControlPanelItem from './ControlPanelItem.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {any} type
	 * @property {string} [prefix]
	 * @property {any} column_stepsOfFields
	 * @property {any} addColumnFromInput
	 * @property {any} dd_relatedRoot
	 * @property {any} QMSName
	 * @property {any} currentQMS_info
	 */

	/** @type {Props} */
	let {
		type,
		prefix = '',
		column_stepsOfFields,
		addColumnFromInput,
		dd_relatedRoot,
		QMSName,
		currentQMS_info
	} = $props();
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
