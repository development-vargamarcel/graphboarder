<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import {
		get_KindsArray,
		get_rootName,
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
	export let stepsOfFieldsNew = [];
	stepsOfFieldsNew = [...stepsOfFieldsNew]; // so each tree will have it's own stepsOfFieldsNew
	export let depth = 0;
	let {
		dd_kindsArray,
		dd_namesArray,
		dd_rootName,
		dd_displayName,
		dd_kindEl,
		dd_kindEl_NON_NULL,
		dd_kindList,
		dd_kindList_NON_NULL,
		dd_NON_NULL,
		dd_relatedRoot
	} = type;

	let showExpand = false;
	let expandData = {};
	let canExpand = false;
	if (!dd_kindsArray?.includes('SCALAR') && dd_kindsArray.length > 0) {
		canExpand = true;
	}
	const expand = () => {
		console.log('dd_rootName', dd_rootName);
		expandData = getRootType($introspectionResult.rootTypes, dd_rootName);
		if (expandData) {
			if (!showExpand) {
				stepsOfFieldsNew.push(dd_displayName);
			} else {
				// does the trick if you hide one by one from last one
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
		{index}
		{showExpand}
		{template}
		{stepsOfFieldsNew}
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
				{#each expandData.fields || expandData.inputFields || expandData.enumValues as type, index (index)}
					<svelte:self {index} {type} {template} {stepsOfFieldsNew} {depth} on:colAddRequest />
				{/each}
			</div>
		</div>
	{/if}
</div>
{#if !showExpand}
	<div class="pt-2 text-center text-xs" />
{/if}
