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
	import ArgInfoDisplay from './ArgInfoDisplay.svelte';

	export let index;
	export let type;
	export let template;
	export let parentKinds = [];
	export let parentNameToDisplay = '';
	export let parentIdentifier = '';
	export let stepsOfFieldsNew = [];
	stepsOfFieldsNew = [...stepsOfFieldsNew]; // so each tree will have it's own stepsOfFieldsNew
	let indetifier = Math.random();
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
		canExpand = true;
	}
	const expand = () => {
		console.log('name', name);
		expandData = getRootType($introspectionResult.rootTypes, name);
		if (expandData) {
			stepsOfFieldsNew.push(nameToDisplay);
			showExpand = !showExpand;
		}
		console.log('expandData', expandData);
	};
</script>

<div class="pt-2 text-center text-xs" />

<div
	class="  pb-0 pl-1 pr-0  rounded-r-sm rounded-l-none shadow-none  space-x-2  normal-case text-xs min-w-max {showExpand
		? ''
		: ''}"
>
	<ArgInfoDisplay
		on:radioClick
		on:checkboxClick
		{template}
		{canExpand}
		{expand}
		{showExpand}
		{index}
		{type}
		{names}
		{nameToDisplay}
		{kinds}
		{parentKinds}
		{parentNameToDisplay}
		{parentIdentifier}
		{stepsOfFieldsNew}
	/>

	{#if showExpand}
		<div class="mb-2 text-center text-xs" />

		<div class="border-l-2 border-secondary bg-accent/5">
			<div class="">
				{#each expandData.inputFields || expandData.enumValues as arg, index}
					<div>
						<svelte:self
							{index}
							type={arg}
							{template}
							parentKinds={kinds}
							parentNameToDisplay={nameToDisplay}
							parentIdentifier={indetifier}
							{stepsOfFieldsNew}
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
