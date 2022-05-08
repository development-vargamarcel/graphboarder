<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';

	import {
		elementToDisplay,
		getRootType,
		getRootType_KindsArray,
		getRootType_Name,
		getRootType_NamesArray
	} from '$lib/utils/usefulFunctions';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let canExpand;
	export let expand;
	export let showExpand;
	export let index;
	export let type;
	export let names;
	export let nameToDisplay;
	export let kinds;
	export let parentKinds;
	export let parentNameToDisplay;
	export let parentIdentifier;
	export let template;
	//only for  changeArguments
	let inUse;
	const _elementToDisplay = elementToDisplay({
		kinds,
		names,
		parentKinds,
		parentNameToDisplay,
		parentIdentifier
	});
	console.log('elementToDisplay', _elementToDisplay);

	// testing
	let RootType_Name = getRootType_Name(names);
	let RootType = getRootType($introspectionResult.rootTypes, RootType_Name);
	let inputFields = RootType?.inputFields;
	let enumValues = RootType?.enumValues;
	let allInputFieldsAreScalar = inputFields?.every((field) => {
		return getRootType_KindsArray(field).includes('SCALAR');
	});

	console.log('*RootType*', RootType);
	console.log('*allInputFieldsAreScalar*', allInputFieldsAreScalar);

	/// do the above for enums

	let enumFields;
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
{:else if template == 'changeArguments'}
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label
		class=" cursor-pointer  hover:text-primary px-2 rounded-box flex text-base min-w-max  w-full"
	>
		<div class=" pr-2  w-full min-w-max">{nameToDisplay}</div>

		{#if canExpand && !allInputFieldsAreScalar && !enumValues}
			<div class="w-10  " on:click={expand}>
				{#if showExpand}
					<div class="bi bi-chevron-down mx-auto w-min" />
				{:else}
					<div class="bi bi-chevron-right mx-auto   w-min" />
				{/if}
			</div>
		{:else}
			<div
				class="w-10  "
				on:click={() => {
					let infoToCast = { inputFields, enumValues, ..._elementToDisplay };
					console.log('infoToCast', infoToCast);
					//add it

					//infos about enums:
					//https://blog.logrocket.com/what-you-need-to-know-about-graphql-enums/
					//!!!  But the enum value as String is not valid. The field using an enum type requires an enum reference, so passing the enum value isn’t considered valid.

					//other important info https://dgraph.io/docs/graphql/queries/and-or-not/
				}}
			>
				<div class="bi bi-plus mx-auto   w-min " />
			</div>
		{/if}
	</label>
{/if}
