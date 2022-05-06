<script>
	//!!! ENUM TYPES WILL CREATE SOM PROBLEMS AS OF 5/6/2022
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import {
		getRootType_KindsArray,
		getRootType_Name,
		getDisplay_Name,
		getRootType,
		getRootType_NamesArray
	} from '$lib/utils/usefulFunctions';

	export let index;
	export let type;
	let names = [];
	let kinds = [];

	names = getRootType_NamesArray(type);
	kinds = getRootType_KindsArray(type);
	let name = getRootType_Name(names);
	let nameToDisplay = getDisplay_Name(names);

	let showExpand = false;
	let expandData = {};
	let canExpand = false;
	if (!kinds.includes('SCALAR') && kinds.length > 0) {
		console.log('kinds ===========', kinds);
		canExpand = true;
	}
	const expand = () => {
		console.log('name', name);
		expandData = getRootType($introspectionResult.rootTypes, name);
		if (expandData) {
			showExpand = !showExpand;
		}
		console.log('expandData', expandData);
	};
</script>

<div class="pt-2 text-center text-xs" />

<div
	class="  pb-0 pl-1 pr-0  rounded-r-sm rounded-l-none shadow-none  space-x-2  normal-case text-xs {showExpand
		? ''
		: ''}"
>
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

	{#if showExpand}
		<div class="mb-2 text-center text-xs" />

		<div class="border-l-2 border-secondary bg-accent/5">
			<div class="">
				{#each expandData.inputFields || expandData.enumValues as arg, index}
					<div>
						<svelte:self {index} type={arg} />
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
{#if !showExpand}
	<div class="pt-2 text-center text-xs" />
{/if}
