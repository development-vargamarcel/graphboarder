<script>
	import { elementToDisplay } from '$lib/utils/usefulFunctions';
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
	export let choosenMultiple = [];
	export let choosenSingle = '';

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
	$: console.log('choosenSingleqqq', choosenSingle, _elementToDisplay.displayName, names);
	$: console.log('choosenMultipleqqq', choosenMultiple, _elementToDisplay.displayName, names);
	const handleClick_checkbox = () => {
		dispatch('checkboxClick', { name: _elementToDisplay.displayName });
	};
	const handleClick_radio = () => {
		dispatch('radioClick', { name: _elementToDisplay.displayName });
	};

	$: if (choosenSingle == _elementToDisplay.displayName) {
		inUse = true;
		console.log('[[inUse', inUse);
	} else {
		inUse = false;
		console.log('[[inUse', inUse);
	}

	$: if (choosenMultiple.includes(_elementToDisplay.displayName)) {
		inUse = true;
		console.log('[[inUse', inUse);
	} else {
		inUse = false;
		console.log('[[inUse', inUse);
	}
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
		{#if !canExpand}
			{#if _elementToDisplay.isListElement}
				<input
					type="checkbox"
					on:click={handleClick_checkbox}
					bind:checked={inUse}
					value={_elementToDisplay.displayName}
					name={_elementToDisplay.groupIdentifier}
					class="checkbox checkbox-sm mr-2"
				/>
			{:else}
				<input
					type="radio"
					on:click={handleClick_radio}
					checked={inUse}
					value={_elementToDisplay.displayName}
					name={_elementToDisplay.groupIdentifier}
					class="checkbox checkbox-sm mr-2"
				/>
			{/if}
		{/if}
		<div class=" pr-2  w-full min-w-max">{nameToDisplay}</div>

		{#if canExpand}
			<div class="w-10  " on:click={expand}>
				{#if showExpand}
					<div class="bi bi-chevron-down mx-auto w-min" />
				{:else}
					<div class="bi bi-chevron-right mx-auto   w-min" />
				{/if}
			</div>
		{/if}
	</label>
	{#if !canExpand}
		{#if !_elementToDisplay.isENUM}
			{#if inUse}
				{#if _elementToDisplay.isListElement}
					{#if _elementToDisplay.displayType == 'text' || _elementToDisplay.displayType == 'number' || _elementToDisplay.displayType == 'date'}
						<textarea
							type={_elementToDisplay.displayType}
							class="textarea textarea-sm textarea-primary w-11/12 mr-4"
						/>
					{:else if _elementToDisplay.displayType == 'geo'}
						put map here
					{:else if _elementToDisplay.displayType == 'none'}
						<!-- else content here -->
					{:else}
						something else
					{/if}
				{:else if _elementToDisplay.displayType == 'text' || _elementToDisplay.displayType == 'number' || _elementToDisplay.displayType == 'date'}
					<input
						type={_elementToDisplay.displayType}
						class="input input-sm input-primary  w-11/12 mr-4"
					/>
				{:else if _elementToDisplay.displayType == 'geo'}
					put map here
				{:else if _elementToDisplay.displayType == 'none'}
					<!-- else content here -->
				{:else}
					something else
				{/if}
			{/if}
		{/if}
	{/if}
{/if}
