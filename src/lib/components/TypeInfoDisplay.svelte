<script>
	import { introspectionResult } from './../stores/introspectionResult.ts';
	import {
		generateFragmentData,
		getRootType_Name,
		stepsOfFieldsToColData
	} from '$lib/utils/usefulFunctions';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let canExpand;
	export let expand;
	export let type;
	export let names;
	export let name;
	export let kinds;
	export let nameToDisplay;
	export let index;
	export let showExpand;
	export let template = 'default';
	export let stepsOfFields;
</script>

{#if template == 'default'}
	<div class="flex space-x-2">
		<div class="flex space-x-2 w-1/3">
			{#if canExpand}
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
					console.log(names);
				}}
			>
				{nameToDisplay}
			</div>
		</div>

		<div class="w-1/2 ">
			<div class="flex">
				<div class="bg-secondary p-1 rounded ">{kinds.join(' of ')}</div>

				{#if !canExpand}
					{#if nameToDisplay == names[names.length - 1]}
						{''}
					{:else}
						<div class="bg-base-200 p-1 rounded">
							{names[names.length - 1]}
						</div>
					{/if}
				{/if}
				{#if canExpand}
					<div class="bg-base-200  rounded px-2 py-1">
						{#if names[0] !== nameToDisplay}
							({names[0]})
						{:else if names[1] && names[1] !== nameToDisplay}
							({names[1]})
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
{:else if template == 'columnAddDisplay'}
	<div class="w-full cursor-pointer  hover:text-primary px-2 rounded-box flex text-base">
		<div
			class="w-full pr-2 text-md {false ? 'cursor-no-drop hover:text-base-300 text-base-200' : ''}"
			on:click={() => {
				if (kinds.includes('SCALAR')) {
					stepsOfFields.push([nameToDisplay]);
				} else {
					let fragmentDataFlatten = generateFragmentData(
						type,
						$introspectionResult.rootTypes,
						true
					);
					stepsOfFields.push([fragmentDataFlatten[0]], fragmentDataFlatten[1]);
				}
				dispatch('colAddRequest', {
					title: `col-${Math.floor(Math.random() * 200)}`,
					queryFragment: stepsOfFieldsToColData(stepsOfFields)
				});
				// console.log(type);
				// console.log(name);
				// console.log(stepsOfFields);
				stepsOfFields = [];
			}}
		>
			{nameToDisplay}
		</div>

		{#if canExpand}
			<div class="w-10  " on:click={expand}>
				{#if showExpand}
					<div class="bi bi-chevron-down mx-auto w-min" />
				{:else}
					<div class="bi bi-chevron-right mx-auto   w-min" />
				{/if}
			</div>
		{/if}
	</div>
{/if}
