<script>
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
	let checkboxChecked;
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
		class=" cursor-pointer  hover:text-primary px-2 rounded-box flex text-base min-w-max  w-full "
	>
		{#if !canExpand}
			{#if parentKinds.includes('ENUM')}
				{#if parentKinds.includes('LIST') || parentKinds.length == 0}
					<input
						type="checkbox"
						bind:checked={checkboxChecked}
						name={parentNameToDisplay + parentIdentifier}
						class="checkbox checkbox-sm mr-2"
					/>
				{:else}
					<input
						type="radio"
						bind:value={checkboxChecked}
						name={parentNameToDisplay + parentIdentifier}
						class="checkbox checkbox-sm mr-2"
					/>
				{/if}
			{:else}
				<input
					type="checkbox"
					bind:checked={checkboxChecked}
					name={parentNameToDisplay + parentIdentifier}
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
	{#if !canExpand && checkboxChecked}
		<div class="w-min-max pr-3">
			{#if names[names.length - 1] == 'String' || names[names.length - 1] == 'Int'}
				<input
					type={names[names.length - 1] == 'Int' ? 'number' : 'text'}
					class="input input-sm input-primary  w-full"
				/>
			{/if}
		</div>
	{/if}
{/if}
