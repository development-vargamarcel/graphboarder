<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import {
		get_KindsArray,
		get_mainName,
		get_displayName,
		getRootType,
		get_NamesArray,
		stepsOfFieldsToColData
	} from '$lib/utils/usefulFunctions';
	import Arg from './Arg.svelte';
	import TypeInfoDisplay from './TypeInfoDisplay.svelte';
	export let template;
	export let index;
	export let type;
	export let stepsOfFields = [];
	export let stepsOfFieldsNew = [];
	stepsOfFieldsNew = [...stepsOfFieldsNew]; // so each tree will have it's own stepsOfFieldsNew
	export let depth = 0;
	let names = [];
	let kinds = [];

	names = get_NamesArray(type);
	kinds = get_KindsArray(type);
	let name = get_mainName(names);
	let nameToDisplay = get_displayName(names);

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
			if (!showExpand) {
				stepsOfFields.push([nameToDisplay]);
				stepsOfFieldsNew.push(nameToDisplay);
			} else {
				// does the trick if you hide one by one from last one
				stepsOfFields.splice(-1);
				stepsOfFieldsNew.splice(-1);
			}

			showExpand = !showExpand;
		}
		console.log('expandData', expandData);
	};
</script>

{#if template == 'default'}
	<div class="pt-2 text-center text-xs" />
{/if}

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
		{stepsOfFieldsNew}
		{name}
	/>

	{#if showExpand}
		<div class="mb-2 text-center text-xs" />
		{#if type?.args && template == 'default'}
			<div class="border-l-2 border-secondary bg-accent/5">
				<div class="">
					{#each type?.args as arg, index}
						<Arg {index} type={arg} {template} />
					{/each}
				</div>
			</div>
		{/if}

		<div class="border-l-2 bg-accent/5">
			<div class="w-min-max w-full">
				{#each expandData.fields as type, index (index)}
					<svelte:self
						{index}
						{type}
						{template}
						{stepsOfFields}
						{stepsOfFieldsNew}
						{depth}
						on:colAddRequest
					/>
				{/each}
			</div>
		</div>
	{/if}
</div>
{#if !showExpand}
	<div class="pt-2 text-center text-xs" />
{/if}
