<script>
	import { generateTitleFromStepsOfFields, getRootType } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher, getContext } from 'svelte';
	const dispatch = createEventDispatcher();
	export let canExpand;
	export let expand;
	export let type;
	export let index;
	export let showExpand;
	export let template = 'default';
	export let stepsOfFields;
	let { dd_kindsArray, dd_namesArray, dd_displayName, dd_rootName } = type;
	export let prefix = '';

	const QMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	const tableColsData_Store = QMSWraperContext?.tableColsData_Store;
</script>

{#if template == 'default'}
	<div class="flex space-x-2 min-w-max  w-full">
		<div class="flex space-x-2 w-1/3 min-w-max  w-full">
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
					//console.log(dd_namesArray);
				}}
			>
				{dd_displayName}
			</div>
		</div>
		{#if !canExpand}
			<div
				class="btn btn-xs bg-base-200 p-1 rounded"
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
		{#if canExpand}
			<div
				class="btn btn-xs  btn-accent normal-case  rounded px-2 py-1"
				on:click={() => {
					console.log(getRootType(null, dd_rootName, schemaData));
				}}
			>
				{#if dd_namesArray?.[1] && dd_namesArray?.[1] !== dd_displayName}
					{dd_namesArray?.[1]}
				{:else}
					{dd_namesArray?.[0]}
				{/if}
			</div>
		{/if}
		<div class="w-1/2 ">
			<div class="flex">
				<div class="bg-secondary p-1 rounded ">{dd_kindsArray?.join(' of ')}</div>
			</div>

			<div class="flex" />
		</div>
		<div class="w-1/8 text-center text-xs" />
	</div>
{:else if template == 'columnAddDisplay'}
	<div class="min-w-max  w-full  cursor-pointer   px-2 rounded-box flex text-base select-none">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="min-w-max  w-full  pr-2 text-md hover:text-primary active:font-black duration-100  "
			on:click={() => {
				if (canExpand) {
					expand();
				} else {
					let tableColData = {
						title: `col-${Math.floor(Math.random() * 200)},${generateTitleFromStepsOfFields(
							stepsOfFields
						)} `,
						stepsOfFields: stepsOfFields
					};
					tableColsData_Store.addColumn(tableColData);
				}
			}}
		>
			{dd_displayName}
		</div>

		{#if canExpand}
			<div
				class="w-10 hover:text-primary active:scale-150 duration-300 bi  mx-auto w-min {showExpand
					? 'bi-chevron-down'
					: 'bi-chevron-right'}"
				on:click={expand}
			/>
		{/if}
	</div>
{/if}
