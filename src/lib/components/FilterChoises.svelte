<script lang="ts">
	interface Props {
		id: any;
		choises?: any;
		title?: any;
		modalTitle?: any;
		type?: string;
		chosenDefault: any;
		chosen?: any;
		onFilterChanged?: (detail: { id: any; chosen: any }) => void;
	}

	let {
		id,
		choises = [''],
		title = choises[0],
		modalTitle = title,
		type = $bindable('radio'),
		chosenDefault,
		chosen = $bindable(chosenDefault ? JSON.parse(JSON.stringify(chosenDefault)) : []),
		onFilterChanged
	}: Props = $props();

	choises.length == 1 ? (type = 'toggle') : '';
	$effect(() => {
		if (chosen || !chosen) {
			onFilterChanged?.({ id: id, chosen: chosen });
			//console.log('filterChanged');
		}
	});
</script>

<div class="rounded-box border-2 border-base-300 overflow-hidden pb-3 bg-base-100">
	{#if type !== 'toggle'}
		<h4 class="text-xl pl-2 pt-1 pb-1  bg-base-300 ">{modalTitle}</h4>
	{/if}
	<div class="form-control mt-3">
		{#if type == 'radio'}
			{#each choises as choice}
				<label
					class=" w-11/12 mx-auto cursor-pointer label  rounded-box  transition font-light  border-2 border-dotted border-transparent  active:border-base-content/50 active:bg-primary/5 {chosen ==
					choice
						? 'font-bold'
						: null}"
				>
					<span class="label-text  text-lg"
						>{choice}
						{#if chosenDefault && chosenDefault == choice}
							<div class="badge badge-xs  badge-info">default</div>
						{/if}
					</span>
					<input type="radio" name={modalTitle} class="radio" value={choice} bind:group={chosen} />
				</label>
			{/each}{:else}
			{#each choises as choice}
				<label
					class="w-11/12 mx-auto cursor-pointer label  rounded-box  transition font-light border-2 border-dotted border-transparent  active:border-base-content/50 active:bg-primary/5 {chosen.includes(
						choice
					)
						? 'font-bold '
						: null}"
				>
					<span class="label-text  text-lg"
						>{choice}
						{#if chosenDefault && chosenDefault.includes(choice)}
							<div class="badge badge-xs  badge-info">default</div>
						{/if}
					</span>
					<input
						type="checkbox"
						name={modalTitle}
						class={type}
						value={choice}
						bind:group={chosen}
					/>
				</label>
			{/each}{/if}
	</div>
</div>
{chosen}

<style>
	.noStyles {
		all: unset;
	}
</style>
