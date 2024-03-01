<script>
	import Toggle from '$lib/components/fields/Toggle.svelte';
	import { getContext } from 'svelte';
	export let prefix = '';
	const dndIsOn = getContext(`${prefix}dndIsOn`);
	const mutationVersion = getContext(`${prefix}mutationVersion`);
	export let hasGroup_argsNode;
</script>

<div class="btn btn-ghost btn-xs w-min flex ml-4 {hasGroup_argsNode ? '' : 'pt-1'}">
	<Toggle
		useSwap
		swapOnText="dnd"
		showValue={false}
		otherClases="toggle-xs"
		rawValue={$dndIsOn}
		on:changed={() => {
			$dndIsOn = !$dndIsOn;
		}}
	/>
</div>
<div class="btn btn-ghost btn-xs w-min flex ml-4 {hasGroup_argsNode ? '' : 'pt-1'}">
	<Toggle
		useSwap
		swapOnText="mutVer"
		showValue={false}
		otherClases="toggle-xs"
		rawValue={$mutationVersion}
		on:changed={() => {
			$mutationVersion = !$mutationVersion;
		}}
	/>
</div>
