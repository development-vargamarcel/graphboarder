<script>
	import {
		generateArgData,
		generateContainerData
	} from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher, getContext } from 'svelte';
	const dispatch = createEventDispatcher();
	export let expand;
	export let showExpand;
	export let index;
	export let type;
	console.log({ type });

	export let template;
	export let stepsOfFields;
	export let predefinedFirstSteps;
	export let groupName;
	if (stepsOfFields.length == 0 && predefinedFirstSteps) {
		stepsOfFields = [...predefinedFirstSteps];
	}
	let {
		dd_kindsArray,
		dd_namesArray,
		dd_rootName,
		dd_displayName,
		dd_kindList,
		dd_kindEl,
		dd_NON_NULL,
		dd_canExpand,
		dd_shouldExpand,
		dd_filterOperators
	} = type;
	export const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	const addFilter = () => {
		dispatch('argAddRequest', generateArgData(stepsOfFields, type, schemaData));
	};
	const addContainer = () => {
		dispatch('containerAddRequest', generateContainerData(stepsOfFields, type));
	};
</script>

{#if template == 'default'}
	<div class="flex space-x-2">
		<div class="flex space-x-2 w-1/3">
			{#if dd_canExpand}
				<div class="btn btn-xs  p-1 rounded normal-case" on:click={expand}>
					{showExpand ? '-' : '+'}
				</div>
			{:else}
				<div class="btn btn-xs  p-1 rounded normal-case btn-disabled" on:click={expand}>+</div>
			{/if}
			<div class="bg-secondary p-1 rounded">{index + 1}</div>
			<div
				class="btn btn-xs btn-info normal-case font-light "
				on:click={() => {
					console.log(type);
					//console.log(dd_namesArray);
				}}
			>
				{dd_displayName}
			</div>
		</div>

		<div class="w-1/2 ">
			<div class="flex">
				<div class="bg-secondary p-1 rounded ">{dd_kindsArray.join(' of ')}</div>

				{#if !dd_canExpand}
					<div
						class="btn btn-xs  bg-base-200 p-1 rounded"
						on:click={() => {
							console.log(getRootType(null, dd_rootName, schemaData));
						}}
					>
						{#if dd_displayName == dd_namesArray[dd_namesArray.length - 1]}
							{''}
						{:else}
							{dd_namesArray[dd_namesArray.length - 1]}
						{/if}
					</div>
				{/if}
				{#if dd_canExpand}
					<div
						class="btn btn-xs  bg-base-200  rounded px-2 py-1"
						on:click={() => {
							console.log(getRootType(null, dd_rootName, schemaData));
						}}
					>
						{#if dd_namesArray[0] !== dd_displayName}
							({dd_namesArray[0]})
						{:else if dd_namesArray[1] && dd_namesArray[1] !== dd_displayName}
							({dd_namesArray[1]})
						{:else}
							{'same'}
						{/if}
					</div>
				{/if}
			</div>

			<div class="flex" />
		</div>
		<div class="w-1/8 text-center text-xs" />
	</div>
{:else if template == 'changeArguments'}
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label
		class=" cursor-pointer  hover:text-primary px-2 py-2 rounded-box flex text-base min-w-max  w-full active:font-black duration-100 select-none"
		on:click={() => {
			/////
			if (dd_kindEl == 'INPUT_OBJECT') {
				addContainer();
			} else {
				addFilter();
			}

			///////
			// // if (dd_canExpand && !allInputFieldsAreScalar && !enumValues) {
			// //		if (dd_shouldExpand) {
			// if (dd_kindList && dd_shouldExpand) {
			// 	addContainer();
			// } else if (dd_kindEl == 'INPUT_OBJECT') {
			// 	addContainer();
			// } else if (
			// 	getRootType(null, dd_rootName, schemaData)?.dd_baseFilterOperators ||
			// 	getRootType(null, dd_rootName, schemaData)?.dd_nonBaseFilterOperators
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
		<div class=" pr-2  w-full min-w-max {dd_NON_NULL && 'underline underline-offset-0'}">
			{dd_displayName}
		</div>

		<div class="w-10  ">
			{#if dd_kindEl == 'INPUT_OBJECT'}
				{#if dd_kindList}
					<div class="bi bi-card-list mx-auto w-min" />
				{:else}
					<div class="bi bi-box mx-auto w-min" />
				{/if}
				{#if showExpand}
					<div class="bi bi-chevron-down mx-auto w-min" />{/if}
			{/if}
		</div>

		<!-- {#if dd_shouldExpand} -->
		<!-- {#if true} -->
		<!-- <div class="w-10  ">
			{#if dd_kindList && dd_shouldExpand}
				<div class="bi bi-card-list mx-auto w-min" />
			{:else if dd_kindEl == 'INPUT_OBJECT'}
				<div class="bi bi-box mx-auto w-min" />
			{:else if showExpand}
				<div class="bi bi-chevron-down mx-auto w-min" />
			{/if}
		</div> -->
		<!-- {:else} -->
		<!-- <div class="w-10  ">
				<div class="bi bi-plus mx-auto   w-min " />
			</div> -->
		<!-- {/if} -->
	</label>
{/if}
