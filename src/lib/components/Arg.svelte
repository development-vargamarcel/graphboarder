<script>
	let {
		index,
		type,
		template,
		predefinedFirstSteps,
		stepsOfFields = $bindable([]),
		groupName,
		prefix
	} = $props();

	import Arg from './Arg.svelte';
	//!!! ENUM TYPES WILL CREATE SOM PROBLEMS AS OF 5/6/2022
	import { fade, fly, slide } from 'svelte/transition';
	/** @type {{index: any, type: any, template: any, predefinedFirstSteps: any, stepsOfFields?: any, groupName: any,prefix: any}} */

	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	import { getRootType } from '$lib/utils/usefulFunctions';
	import ArgInfoDisplay from '$lib/components/ArgInfoDisplay.svelte';
	import { circIn, expoIn, expoOut } from 'svelte/easing';
	import { getContext } from 'svelte';

	console.log({ type });
	console.log({ predefinedFirstSteps });

	if (stepsOfFields.length == 0 && predefinedFirstSteps) {
		stepsOfFields = [...predefinedFirstSteps];
	}
	stepsOfFields = [...stepsOfFields]; // so each tree will have it's own stepsOfFields
	let indetifier = Math.random();
	let { dd_kindsArray, dd_rootName, dd_displayName } = type;

	let showExpand = $state(false);
	let expandData = $state({});
	let canExpand = false;
	if (!dd_kindsArray.includes('SCALAR') && dd_kindsArray.length > 0) {
		canExpand = true;
	}
	let inDuration = $state(300);
	const expand = () => {
		//console.log('dd_rootName', dd_rootName);
		expandData = getRootType($schemaData.rootTypes, dd_rootName, schemaData);
		if (expandData) {
			if (!showExpand) {
				stepsOfFields.push(dd_displayName);
			} else {
				// does the trick if you hide one by one from last one
				stepsOfFields.splice(-1);
			}

			showExpand = !showExpand;
		}

		inDuration = expandData?.inputFields?.length * 100;
		inDuration = inDuration < 300 && inDuration > 200 ? inDuration : 300;
		//console.log('inDuration', inDuration);
		//console.log('expandData', expandData);
	};
</script>

{#if template == 'default'}<div class="pt-2 text-center text-xs"></div>{/if}

<div
	class="  pb-0 pl-1 pr-0 rounded-r-sm rounded-l-none shadow-none space-x-2 normal-case text-xs min-w-max {showExpand
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
		{stepsOfFields}
		{groupName}
		on:argAddRequest
		on:containerAddRequest
	/>

	{#if showExpand}
		{#if template == 'default'}<div class="mb-2 text-center text-xs"></div>{/if}

		<div
			class="border-l-2 border-secondary bg-accent/5"
			in:slide|global={{ duration: inDuration, easing: expoIn }}
			out:slide|global={{ duration: inDuration, easing: expoOut }}
		>
			<div class="">
				{#each expandData.inputFields || expandData.enumValues as arg, index}
					<div>
						<Arg
							{index}
							type={arg}
							{template}
							{stepsOfFields}
							predefinedFirstSteps={[]}
							{groupName}
							on:argAddRequest
							on:containerAddRequest
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
{#if !showExpand}
	<div class="pt-2 text-center text-xs"></div>
{/if}
