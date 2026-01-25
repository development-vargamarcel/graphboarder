<script lang="ts">
	import Arg from './Arg.svelte';
	//!!! ENUM TYPES WILL CREATE SOM PROBLEMS AS OF 5/6/2022
	import { fade, fly, slide } from 'svelte/transition';
	import { getRootType } from '$lib/utils/usefulFunctions';
	import ArgInfoDisplay from '$lib/components/ArgInfoDisplay.svelte';
	import { circIn, expoIn, expoOut } from 'svelte/easing';
	import { getContext } from 'svelte';
	import { Logger } from '$lib/utils/logger';
    import type { QMSMainWraperContext } from '$lib/types/index';

	const prefix = '';

	interface Props {
		index: any;
		type: any;
		template: string;
		predefinedFirstSteps: any;
		stepsOfFields?: any;
		groupName: any;
		onArgAddRequest?: (detail: any) => void;
		onContainerAddRequest?: (detail: any) => void;
	}

	let {
		index,
		type,
		template,
		predefinedFirstSteps,
		stepsOfFields = $bindable([]),
		groupName,
		onArgAddRequest,
		onContainerAddRequest
	}: Props = $props();

	let mainWraperCtx = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const schemaData = mainWraperCtx?.schemaData;

    $effect(() => {
        Logger.debug({ type });
        Logger.debug({ predefinedFirstSteps });
    });

    $effect(() => {
        if (stepsOfFields.length == 0 && predefinedFirstSteps) {
            stepsOfFields = [...predefinedFirstSteps];
        }
    });

	let indetifier = Math.random();

	let showExpand = $state(false);
	let expandData = $state<any>({});
	let canExpand = $derived(!type.dd_kindsArray.includes('SCALAR') && type.dd_kindsArray.length > 0);
	let inDuration = $state(300);

	const expand = () => {
		//Logger.debug('dd_rootName', type.dd_rootName);
		expandData = getRootType($schemaData.rootTypes, type.dd_rootName, schemaData);
		if (expandData) {
			if (!showExpand) {
				stepsOfFields.push(type.dd_displayName);
			} else {
				// does the trick if you hide one by one from last one
				stepsOfFields.splice(-1);
			}

			showExpand = !showExpand;
		}

		inDuration = (expandData?.inputFields?.length || 0) * 100;
		inDuration = inDuration < 300 && inDuration > 200 ? inDuration : 300;
		//Logger.debug('inDuration', inDuration);
		//Logger.debug('expandData', expandData);
	};
</script>

{#if template == 'default'}<div class="pt-2 text-center text-xs"></div>{/if}

<div
	class="  pb-0 pl-1 pr-0  rounded-r-sm rounded-l-none shadow-none  space-x-2  normal-case text-xs min-w-max {showExpand
		? ''
		: ''}"
>
	<ArgInfoDisplay
		{predefinedFirstSteps}
		{template}
		{expand}
		{showExpand}
		{index}
		{type}
		{stepsOfFields}
		{groupName}
		{onArgAddRequest}
		{onContainerAddRequest}
	/>

	{#if showExpand}
		{#if template == 'default'}<div class="mb-2 text-center text-xs"></div>{/if}

		<div
			class="border-l-2 border-secondary bg-accent/5"
			in:slide|global={{ duration: inDuration, easing: expoIn }}
			out:slide|global={{ duration: inDuration, easing: expoOut }}
		>
			<div class="">
				{#each expandData?.inputFields || expandData?.enumValues || [] as arg, index}
					<div>
						<Arg
							{index}
							type={arg}
							{template}
							{stepsOfFields}
							predefinedFirstSteps={[]}
							{groupName}
							{onArgAddRequest}
							{onContainerAddRequest}
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
