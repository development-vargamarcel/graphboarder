<script lang="ts">
	import { run } from 'svelte/legacy';

	import { getContext } from 'svelte';
	interface Props {
		prefix?: string;
		node: any;
	}

	let { prefix = '', node }: Props = $props();
	let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
	const { mergedChildren_controlPanel_Store } = getContext(`${prefix}OutermostQMSWraperContext`);
	let currentObject = {
		stepsOfFieldsThisAppliesTo: activeArgumentsContext?.stepsOfFieldsThisAppliesTo,
		nodeId: node.id,
		id: Date.now() + Math.random()
	};
	let objIsStarred = $derived(mergedChildren_controlPanel_Store.getObj(currentObject));
	run(() => {
		console.log({ objIsStarred });
	});
</script>

<button
	class="flex btn btn-xs "
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
