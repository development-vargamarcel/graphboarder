<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import { Logger } from '$lib/utils/logger';
	interface Props {
		prefix?: string;
		node: any;
	}

	let { prefix = '', node }: Props = $props();
	let activeArgumentsContext = getContext<any>(`${untrack(() => prefix)}activeArgumentsContext`);
	const OutermostQMSWraperContext = getContext<any>(`${untrack(() => prefix)}OutermostQMSWraperContext`);
	const mergedChildren_controlPanel_Store = OutermostQMSWraperContext?.mergedChildren_controlPanel_Store;
	let currentObject = $derived({
		stepsOfFieldsThisAppliesTo: activeArgumentsContext?.stepsOfFieldsThisAppliesTo,
		nodeId: node.id,
		id: Date.now() + Math.random()
	});
	let objIsStarred = $derived(mergedChildren_controlPanel_Store.getObj(currentObject));
	$effect(() => {
		Logger.debug({ objIsStarred });
	});
</script>

<button
	class="flex btn btn-xs "
	aria-label={objIsStarred ? 'Remove from control panel' : 'Add to control panel'}
	title={objIsStarred ? 'Remove from control panel' : 'Add to control panel'}
	onclick={() => {
		if (objIsStarred) {
			mergedChildren_controlPanel_Store.delete(currentObject);
		} else {
			mergedChildren_controlPanel_Store.addOrReplaceKeepingOldId(currentObject);
		}
		objIsStarred = mergedChildren_controlPanel_Store.getObj(currentObject);
	}}
>
	<i class="bi  {objIsStarred ? 'bi-star-fill' : 'bi-star'}"></i>
</button>
