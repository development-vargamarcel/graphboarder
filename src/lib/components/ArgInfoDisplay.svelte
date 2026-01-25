<script lang="ts">
	import {
		generateArgData,
		generateContainerData
	} from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import { Logger } from '$lib/utils/logger';
    import type { QMSMainWraperContext } from '$lib/types/index';

	interface Props {
		expand: any;
		showExpand: any;
		index: any;
		type: any;
		template: string;
		stepsOfFields?: any;
		predefinedFirstSteps?: any;
		groupName?: any;
		onArgAddRequest?: (detail: any) => void;
		onContainerAddRequest?: (detail: any) => void;
	}

	let {
		expand,
		showExpand,
		index,
		type,
		template,
		stepsOfFields = $bindable(),
		predefinedFirstSteps,
		groupName,
		onArgAddRequest,
		onContainerAddRequest
	}: Props = $props();

    $effect(() => {
        if (stepsOfFields.length == 0 && predefinedFirstSteps) {
            stepsOfFields = [...predefinedFirstSteps];
        }
    });

    $effect(() => {
        Logger.debug({ type });
    });

	const prefix = '';
	let QMSMainWraperContext = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	let schemaData = $derived(QMSMainWraperContext?.schemaData);

	const addFilter = () => {
		onArgAddRequest?.(generateArgData(stepsOfFields, type, schemaData));
	};
	const addContainer = () => {
		onContainerAddRequest?.(generateContainerData(stepsOfFields, type));
	};
</script>

{#if template == 'default'}
	<div class="flex space-x-2">
		<div class="flex space-x-2 w-1/3">
			{#if type.dd_canExpand}
				<button class="btn btn-xs  p-1 rounded normal-case" onclick={expand}>
					{showExpand ? '-' : '+'}
				</button>
			{:else}
				<button class="btn btn-xs  p-1 rounded normal-case btn-disabled" onclick={expand}>+</button>
			{/if}
			<div class="bg-secondary p-1 rounded">{index + 1}</div>
			<button
				class="btn btn-xs btn-info normal-case font-light "
				onclick={() => {
					Logger.debug(type);
					//Logger.debug(type.dd_namesArray);
				}}
			>
				{type.dd_displayName}
			</button>
		</div>

		<div class="w-1/2 ">
			<div class="flex">
				<div class="bg-secondary p-1 rounded ">{type.dd_kindsArray.join(' of ')}</div>

				{#if !type.dd_canExpand}
					<button
						class="btn btn-xs  bg-base-200 p-1 rounded"
						onclick={() => {
							Logger.debug(getRootType(null, type.dd_rootName, schemaData));
						}}
					>
						{#if type.dd_displayName == type.dd_namesArray[type.dd_namesArray.length - 1]}
							{''}
						{:else}
							{type.dd_namesArray[type.dd_namesArray.length - 1]}
						{/if}
					</button>
				{/if}
				{#if type.dd_canExpand}
					<button
						class="btn btn-xs  bg-base-200  rounded px-2 py-1"
						onclick={() => {
							Logger.debug(getRootType(null, type.dd_rootName, schemaData));
						}}
					>
						{#if type.dd_namesArray[0] !== type.dd_displayName}
							({type.dd_namesArray[0]})
						{:else if type.dd_namesArray[1] && type.dd_namesArray[1] !== type.dd_displayName}
							({type.dd_namesArray[1]})
						{:else}
							{'same'}
						{/if}
					</button>
				{/if}
			</div>

			<div class="flex"></div>
		</div>
		<div class="w-1/8 text-center text-xs"></div>
	</div>
{:else if template == 'changeArguments'}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label
		class=" cursor-pointer  hover:text-primary px-2 py-2 rounded-box flex text-base min-w-max  w-full active:font-black duration-100 select-none"
		onclick={() => {
			/////
			if (type.dd_kindEl == 'INPUT_OBJECT') {
				addContainer();
			} else {
				addFilter();
			}

			///////
			// // if (type.dd_canExpand && !allInputFieldsAreScalar && !enumValues) {
			// //		if (type.dd_shouldExpand) {
			// if (type.dd_kindList && type.dd_shouldExpand) {
			// 	addContainer();
			// } else if (type.dd_kindEl == 'INPUT_OBJECT') {
			// 	addContainer();
			// } else if (
			// 	getRootType(null, type.dd_rootName, schemaData)?.dd_baseFilterOperators ||
			// 	getRootType(null, type.dd_rootName, schemaData)?.dd_nonBaseFilterOperators
			// ) {
			// 	addContainer();
			// } else {
			// 	//expand();
			// 	addFilter();
			// }
			// // } else {
			// // 	addFilter();
			// // }
		}}
	>
		<div class=" pr-2  w-full min-w-max {type.dd_NON_NULL && 'underline underline-offset-0'}">
			{type.dd_displayName}
		</div>

		<div class="w-10  ">
			{#if type.dd_kindEl == 'INPUT_OBJECT'}
				{#if type.dd_kindList}
					<div class="bi bi-card-list mx-auto w-min"></div>
				{:else}
					<div class="bi bi-box mx-auto w-min"></div>
				{/if}
				{#if showExpand}
					<div class="bi bi-chevron-down mx-auto w-min"></div>{/if}
			{/if}
		</div>
	</label>
{/if}
