<script>
	//!!! ENUM TYPES WILL CREATE SOM PROBLEMS AS OF 5/6/2022
	import { fade, fly, slide } from 'svelte/transition';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import { getRootType } from '$lib/utils/usefulFunctions';
	import ArgInfoDisplay from './ArgInfoDisplay.svelte';
	import { circIn, expoIn, expoOut } from 'svelte/easing';

	export let index;
	export let type;
	export let template;
	export let predefinedFirstSteps;
	export let stepsOfFieldsNew = [];
	if (stepsOfFieldsNew.length == 0 && predefinedFirstSteps) {
		stepsOfFieldsNew = [...predefinedFirstSteps];
	}
	stepsOfFieldsNew = [...stepsOfFieldsNew]; // so each tree will have it's own stepsOfFieldsNew
	let indetifier = Math.random();
	let { dd_kindsArray, dd_rootName, dd_displayName } = type;

	let showExpand = false;
	let expandData = {};
	let canExpand = false;
	if (!dd_kindsArray.includes('SCALAR') && dd_kindsArray.length > 0) {
		canExpand = true;
	}
	let inDuration = 300;
	const expand = () => {
		//console.log('dd_rootName', dd_rootName);
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

		inDuration = expandData?.inputFields?.length * 100;
		inDuration = inDuration < 300 && inDuration > 200 ? inDuration : 300;
		//console.log('inDuration', inDuration);
		//console.log('expandData', expandData);
	};
</script>

{#if template == 'default'}<div class="pt-2 text-center text-xs" />{/if}

<div
	class="  pb-0 pl-1 pr-0  rounded-r-sm rounded-l-none shadow-none  space-x-2  normal-case text-xs min-w-max {showExpand
		? ''
		: ''}"
>
	<ArgInfoDisplay
		on:radioClick
		on:checkboxClick
		{predefinedFirstSteps}
		{template}
		{expand}
		{showExpand}
		{index}
		{type}
		{stepsOfFieldsNew}
		on:argAddRequest
	/>

	{#if showExpand}
		{#if template == 'default'}<div class="mb-2 text-center text-xs" />{/if}

		<div
			class="border-l-2 border-secondary bg-accent/5"
			in:slide={{ duration: inDuration, easing: expoIn }}
			out:slide={{ duration: inDuration, easing: expoOut }}
		>
			<div class="">
				{#each expandData.inputFields || expandData.enumValues as arg, index}
					<div>
						<svelte:self
							{index}
							type={arg}
							{template}
							{stepsOfFieldsNew}
							predefinedFirstSteps={[]}
							on:argAddRequest
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
{#if !showExpand}
	<div class="pt-2 text-center text-xs" />
{/if}
