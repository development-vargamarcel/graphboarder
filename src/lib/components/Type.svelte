<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import {
		getRootType_KindsArray,
		getRootType_Name,
		getDisplay_Name,
		getRootType,
		getRootType_NamesArray,
		stepsOfFieldsToColData
	} from '$lib/utils/usefulFunctions';
	import Args from './Args.svelte';
	import TypeInfoDisplay from './TypeInfoDisplay.svelte';
	export let template;
	export let index;
	export let type;
	export let stepsOfFields = [];
	let stepsOfFieldsCurr;
	export let depth = 0;
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
			stepsOfFields.push([nameToDisplay]);
			console.log(stepsOfFieldsToColData(stepsOfFields));
			console.log(stepsOfFields);
			showExpand = !showExpand;
		}
		console.log('expandData', expandData);
	};
</script>

{#if template == 'default'}
	<div class="pt-2 text-center text-xs" />{/if}

<div
	class="  pb-0 pl-1 pr-0  rounded-r-sm rounded-l-none shadow-none  space-x-2  normal-case text-xs {showExpand
		? ''
		: ''}"
>
	<TypeInfoDisplay
		on:colAddRequest
		{canExpand}
		{expand}
		{type}
		{names}
		{nameToDisplay}
		{kinds}
		{index}
		{showExpand}
		{template}
		{stepsOfFields}
		{name}
	/>

	{#if showExpand}
		<div class="mb-2 text-center text-xs" />
		{#if type?.args && template == 'default'}
			<Args args={type?.args} />
		{/if}

		<div class="border-l-2 bg-accent/5">
			<div class="">
				{#each expandData.fields as type, index (index)}
					<svelte:self {index} {type} {template} {stepsOfFields} {depth} on:colAddRequest />
				{/each}
			</div>
		</div>
	{/if}
</div>
{#if !showExpand}
	<div class="pt-2 text-center text-xs" />
{/if}
