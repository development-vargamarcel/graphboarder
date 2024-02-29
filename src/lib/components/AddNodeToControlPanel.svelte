<script>
	import { getContext } from 'svelte';
	export let prefix = '';
	export let node;
	let activeArgumentsContext = getContext(`${prefix}activeArgumentsContext`);
	const { mergedChildren_controlPanel_Store } = getContext(`${prefix}OutermostQMSWraperContext`);
	let currentObject = {
		stepsOfFieldsThisAppliesTo: activeArgumentsContext?.stepsOfFieldsThisAppliesTo,
		nodeId: node.id,
		id: Date.now() + Math.random()
	};
	$: objIsStarred = mergedChildren_controlPanel_Store.getObj(currentObject);
	$: console.log({ objIsStarred });
</script>

<button
	class="flex btn btn-xs "
	on:click={() => {
		if (objIsStarred) {
			mergedChildren_controlPanel_Store.delete(currentObject);
		} else {
			mergedChildren_controlPanel_Store.addOrReplaceKeepingOldId(currentObject);
		}
		objIsStarred = mergedChildren_controlPanel_Store.getObj(currentObject);
	}}
>
	<i class="bi  {objIsStarred ? 'bi-star-fill' : 'bi-star'}" />
</button>
