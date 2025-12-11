<script lang="ts">
	import Toggle from '$lib/components/fields/Toggle.svelte';
	import { getContext } from 'svelte';
	const dndIsOn = getContext(`${prefix}dndIsOn`);
	const showInputField = getContext(`${prefix}showInputField`);

	const mutationVersion = getContext(`${prefix}mutationVersion`);
	interface Props {
		prefix?: string;
		hasGroup_argsNode: any;
	}

	let { prefix = '', hasGroup_argsNode }: Props = $props();
</script>

<div class="btn btn-ghost btn-xs w-min flex ml-4 {hasGroup_argsNode ? '' : 'pt-1'}">
	<Toggle
		useSwap
		swapOnText="dnd"
		showValue={false}
		otherClases="toggle-xs"
		rawValue={$dndIsOn}
		onChanged={() => {
			$dndIsOn = !$dndIsOn;
		}}
	/>
</div>
<div class="btn btn-ghost btn-xs w-min flex ml-4 {hasGroup_argsNode ? '' : 'pt-1'}">
	<Toggle
		useSwap
		swapOnText="field"
		showValue={false}
		otherClases="toggle-xs"
		rawValue={$showInputField}
		onChanged={() => {
			$showInputField = !$showInputField;
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
		onChanged={() => {
			$mutationVersion = !$mutationVersion;
		}}
	/>
</div>
