<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';

	import {
		getRootType,
		get_KindsArray,
		get_rootName,
		get_NamesArray
	} from '$lib/utils/usefulFunctions';
	import { stringify } from 'postcss';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let expand;
	export let showExpand;
	export let index;
	export let type;
	export let template;
	export let stepsOfFieldsNew;
	export let predefinedFirstSteps;
	if (stepsOfFieldsNew.length == 0 && predefinedFirstSteps) {
		stepsOfFieldsNew = [...predefinedFirstSteps];
	}
	let {
		dd_kindsArray,
		dd_namesArray,
		dd_rootName,
		dd_displayName,
		dd_kindEl,
		dd_kindEl_NON_NULL,
		dd_kindList,
		dd_kindList_NON_NULL,
		dd_NON_NULL,
		dd_relatedRoot,
		dd_canExpand,
		dd_shouldExpand
	} = type;

	//console.log('====', dd_namesArray, dd_namesArray);
	//only for  changeArguments
	let inUse;

	// testing
	let RootType_Name = dd_rootName;
	let RootType = dd_relatedRoot;
	let inputFields = RootType?.inputFields;
	let enumValues = RootType?.enumValues;
	let allInputFieldsAreScalar = inputFields?.every((field) => {
		return get_KindsArray(field).includes('SCALAR');
	});

	// //console.log('*RootType*', RootType);
	// //console.log('*allInputFieldsAreScalar*', allInputFieldsAreScalar);

	/// do the above for enums

	const addFilter = () => {
		if (stepsOfFieldsNew[stepsOfFieldsNew.length - 1] !== dd_displayName) {
			stepsOfFieldsNew.push(dd_displayName); //take care might caus eproblems
		}

		let infoToCast = {
			inputFields,
			enumValues,
			stepsOfFieldsNew,
			stepsOfFieldsNewStringified: JSON.stringify(stepsOfFieldsNew),
			id: `${JSON.stringify(stepsOfFieldsNew)}${Math.random()}`,
			...type
		};
		//console.log('infoToCast', infoToCast);
		//add it

		dispatch('argAddRequest', infoToCast);

		//infos about enums:
		//https://blog.logrocket.com/what-you-need-to-know-about-graphql-enums/
		//!!!  But the enum value as String is not valid. The field using an enum type requires an enum reference, so passing the enum value isn’t considered valid.
		//other important info https://dgraph.io/docs/graphql/queries/and-or-not/
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
					{#if dd_displayName == dd_namesArray[dd_namesArray.length - 1]}
						{''}
					{:else}
						<div class="bg-base-200 p-1 rounded">
							{dd_namesArray[dd_namesArray.length - 1]}
						</div>
					{/if}
				{/if}
				{#if dd_canExpand}
					<div class="bg-base-200  rounded px-2 py-1">
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
			// if (dd_canExpand && !allInputFieldsAreScalar && !enumValues) {
			if (dd_shouldExpand) {
				expand();
			} else {
				addFilter();
			}
		}}
	>
		<div class=" pr-2  w-full min-w-max {dd_NON_NULL && 'underline underline-offset-0'}">
			{dd_displayName}
		</div>

		<!-- {#if dd_canExpand && !allInputFieldsAreScalar && !enumValues} -->
		{#if dd_shouldExpand}
			<div class="w-10  ">
				{#if showExpand}
					<div class="bi bi-chevron-down mx-auto w-min" />
				{:else}
					<div class="bi bi-chevron-right mx-auto   w-min" />
				{/if}
			</div>
		{:else}
			<!-- <div class="w-10  ">
				<div class="bi bi-plus mx-auto   w-min " />
			</div> -->
		{/if}
	</label>
{/if}
