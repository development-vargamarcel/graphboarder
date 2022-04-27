<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import {
		getRootType_KindsArray,
		getRootType_Name,
		getDisplay_Name,
		getRootType,
		getRootType_NamesArray
	} from '$lib/utils/usefulFunctions';
	import Args from './Args.svelte';
	import TypeInfoDisplay from './TypeInfoDisplay.svelte';
	export let template;
	export let index;
	export let type;

	let names = [];
	let kinds = [];

	names = getRootType_NamesArray(type);
	kinds = getRootType_KindsArray(type);
	let name = getRootType_Name(names);
	let nameToDisplay = getDisplay_Name(names);

	let showExpand = false;
	let expandData = {};
	let canExpand = false;
	if (!kinds.includes('SCALAR')) {
		canExpand = true;
	}
	const expand = () => {
		console.log('name', name);
		expandData = getRootType($introspectionResult.rootTypes, name);
		if (expandData) {
			showExpand = !showExpand;
		}
		console.log('expandData', expandData);
	};
</script>

<div class="pt-2 text-center text-xs" />

<div
	class="  pb-0 pl-1 pr-0  rounded-r-sm rounded-l-none shadow-none  space-x-2  normal-case text-xs {showExpand
		? ''
		: ''}"
>
	<TypeInfoDisplay
		{canExpand}
		{expand}
		{type}
		{names}
		{nameToDisplay}
		{kinds}
		{index}
		{showExpand}
		{template}
	/>

	{#if showExpand}
		<div class="mb-2 text-center text-xs" />
		{#if type?.args}
			<Args args={type?.args} />
		{/if}

		<div class="border-l-2 bg-accent/5">
			<div class="">
				{#each expandData.fields as type, index (index)}
					<svelte:self {index} {type} {template} />
				{/each}
			</div>
		</div>
	{/if}
</div>
{#if !showExpand}
	<div class="pt-2 text-center text-xs" />
{/if}
