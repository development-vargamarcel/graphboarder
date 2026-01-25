<script lang="ts">
	import Type from './Type.svelte';
	import { slide } from 'svelte/transition';
	import { getRootType } from '$lib/utils/usefulFunctions';
	import Arg from '$lib/components/Arg.svelte';
	import TypeInfoDisplay from '$lib/components/TypeInfoDisplay.svelte';
	import { expoIn, expoOut } from 'svelte/easing';
	import { getContext } from 'svelte';
	import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';
	import { get } from 'svelte/store';

	const prefix = '';

	let mainWraperContext = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const OutermostQMSWraperContext = getContext<QMSWraperContext>(`${prefix}OutermostQMSWraperContext`);
	const isForExplorer = OutermostQMSWraperContext?.extraInfo?.isForExplorer;
	const schemaData = mainWraperContext?.schemaData;

	interface Props {
		template: any;
		index: any;
		type: any;
		stepsOfFields: any;
		isOnMainList?: any;
		//stepsOfFields = [...stepsOfFields]; // so each tree will have it's own stepsOfFields
		depth?: number;
		showExpand?: boolean;
	}

	let {
		template,
		index,
		type,
		stepsOfFields = $bindable(),
		isOnMainList = !stepsOfFields,
		depth = 0,
		showExpand = $bindable(false)
	}: Props = $props();

    // Use derived values to react to prop changes
	let dd_kindsArray = $derived(type.dd_kindsArray);
    let dd_rootName = $derived(type.dd_rootName);
    let dd_displayName = $derived(type.dd_displayName);

    $effect(() => {
        if (!stepsOfFields) {
            stepsOfFields = [dd_displayName];
        } else {
            // Check if last element is already current displayName to avoid duplicates if effect runs multiple times
            if (stepsOfFields[stepsOfFields.length - 1] !== dd_displayName) {
                 stepsOfFields = [...stepsOfFields, dd_displayName];
            }
        }
    });

	let inDuration = $state(300);
	let expandData = $state<any>({});
	let canExpand = $derived(!dd_kindsArray?.includes('SCALAR') && dd_kindsArray?.length > 0);

	const expand = () => {
		//console.log('dd_rootName', dd_rootName);
		expandData = getRootType(get(schemaData).rootTypes, dd_rootName, get(schemaData));
		if (expandData) {
			showExpand = !showExpand;
			//console.log('expandData', expandData);
			let typeLen =
				expandData?.fields?.length ||
				expandData?.inputFields?.length ||
				expandData?.enumValues?.length || 0;

			let argLen = 0;
			if (type?.args) {
				argLen = type?.args.length;
			}

			inDuration = (typeLen + argLen) * 100;
			inDuration = inDuration < 300 && inDuration > 200 ? inDuration : 300;
			//console.log('inDuration', inDuration);
			//console.log('expandData', expandData);
		}
	};

	$effect(() => {
		if (canExpand && isOnMainList && !isForExplorer) {
			expand();
		}
	});
</script>

{#if template == 'default'}
	<div class="pt-2 text-center text-xs"></div>
{/if}

<div
	class="  pb-0 pl-1 pr-0  rounded-r-sm rounded-l-none shadow-none  space-x-2  normal-case text-xs {showExpand
		? ''
		: ''}"
>
	<TypeInfoDisplay {canExpand} {expand} {type} {index} {showExpand} {template} {stepsOfFields} />

	{#if showExpand}
		<div
			in:slide|global={{ duration: inDuration, easing: expoIn }}
			out:slide|global={{ duration: inDuration, easing: expoOut }}
		>
			<div class="mb-2== text-center text-xs"></div>

			{#if type?.args && template == 'default'}
				<div class="border-l-2 border-secondary bg-accent/5">
					<div class="">
						{#each type?.args as arg, index}
							<Arg {index} type={arg} {template} predefinedFirstSteps={[]} groupName={undefined} />
						{/each}
					</div>
				</div>
			{/if}

			<div class="border-l-2 bg-accent/5">
				<div class="w-min-max w-full">
					{#each expandData.fields || expandData.inputFields || expandData.enumValues || [] as type, index (index)}
						<Type {index} {type} {template} {stepsOfFields} {depth} />
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
{#if !showExpand || isOnMainList}
	<div class="mb-2 text-center text-xs"></div>
{/if}
