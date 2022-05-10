<script>
	import Modal from '$lib/components/Modal.svelte';
	export let id;
	export let choises = [''];
	export let title = choises[0];
	export let modalTitle = title;
	export let type = 'radio';
	export let size = 'sm';
	export let chosenDefault;
	export let defaultMeansNoChange = true;
	export let chosen = chosenDefault ? JSON.parse(JSON.stringify(chosenDefault)) : [];
	let chosenInternal = JSON.parse(JSON.stringify(chosen));
	let extraInfo = '';
	let extraInfoExtraClass = '';
	let btnExtraClass;
	let titlePreChange = title;
	choises.length == 1 ? (type = 'toggle') : '';

	let chosenPreChange;
	let modalVisible = false;
	let showModalOrToggle = () => {
		if (choises.length > 1) {
			//show modal
			modalVisible = true;
			chosenPreChange = chosen;
			titlePreChange = title;
		} else {
			//toggle
			chosen.length == 1 ? (chosen = []) : (chosen = choises);
			applyFilter();
		}
	};

	let hideModal = () => {
		chosen = chosenPreChange;
		chosenInternal = chosen;
		modalVisible = false;
	};
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let applyFilter = () => {
		if (type !== 'toggle') {
			modalVisible = false;
			chosen = chosenInternal;
		}

		dispatch('filterApplied', { id: id, chosen: chosen });
	};
	$: if (title) {
		if (type == 'toggle') {
			title = chosen;
		} else {
			type == 'radio' ? (title = chosen) : (extraInfo = `${chosen.length}`);
		}
	}

	$: if (chosen.length > 0) {
		if (!modalVisible) {
			chosenInternal = chosen;
		}
		if (defaultMeansNoChange && JSON.stringify(chosenDefault) == JSON.stringify(chosen)) {
			btnExtraClass =
				'btn-outline btn-neutral bg-primary/10 hover:bg-primary/10 hover:text-base-content ';
			extraInfoExtraClass = 'border-base-content text-base-content';
		} else {
			btnExtraClass = 'btn-primary';
			extraInfoExtraClass = 'border-primary-content text-primary-content';
		}

		if (type == 'toggle') {
			title = chosen;
		} else {
			type == 'radio' ? (title = chosen) : (extraInfo = `${chosen.length}`);
		}
	} else {
		if (!modalVisible) {
			chosenInternal = chosen;
		}
		btnExtraClass =
			'btn-outline btn-neutral bg-primary/10 hover:bg-primary/10 hover:text-base-content';
		if (type == 'toggle') {
			title = titlePreChange;
		} else if (type == 'radio') {
			title = titlePreChange;
		} else {
			if (defaultMeansNoChange && JSON.stringify(chosenDefault) !== JSON.stringify(chosen)) {
				btnExtraClass = 'btn-primary';
				extraInfoExtraClass = 'border-primary-content text-primary-content';

				extraInfo = '0';
			} else {
				extraInfo = '';
			}
		}
	}
</script>

<btn
	class="btn btn-sm btn-{size} {btnExtraClass}  flex  w-max normal-case "
	on:click={showModalOrToggle}
>
	{title}
	{#if extraInfo}
		<div
			class="ml-2 space-y-0 border  leading-3 {extraInfoExtraClass} rounded-box  flex space-x-1 px-1"
		>
			<p class=" mx-auto my-0 p-0 text-xs leading-3">
				{extraInfo}
			</p>
			<p />
			<i class="bi bi-chevron-down  mx-auto my-0 p-0 text-xs leading-3" />
		</div>
	{/if}

	{#if type != 'toggle' && !extraInfo}
		<i class="bi bi-chevron-down ml-2 text-xs" />
	{/if}
</btn>
{#if modalVisible}
	<Modal on:cancel={hideModal} on:apply={applyFilter} oneItem={false}>
		<div class="rounded-box overflow-hidden border-2 border-base-300 bg-base-100 pb-3">
			<h4 class="mb-3 overflow-hidden bg-base-300 py-1 pl-2 text-xl ">{modalTitle}</h4>
			<div class="form-control px-2">
				{#if type == 'radio'}
					{#each choises as choice}
						<label
							class="label rounded-box  cursor-pointer   border-2 border-dotted  border-transparent font-light transition  active:border-base-content/50 active:bg-primary/5 {chosenInternal ==
							choice
								? 'font-bold'
								: ''}"
						>
							<span class="label-text  text-lg"
								>{choice}
								{#if chosenDefault && chosenDefault == choice}
									<div class="badge badge-xs  badge-info">default</div>
								{/if}
							</span>
							<input
								type="radio"
								name="chosen"
								class="radio"
								value={choice}
								bind:group={chosenInternal}
							/>
						</label>
					{/each}{:else if type == 'checkbox'}
					{#each choises as choice}
						<label
							class="cursor-pointer label  rounded-box   transition font-light border-2 border-dotted border-transparent  active:border-base-content/50 active:bg-primary/5 {chosenInternal.includes(
								choice
							)
								? 'font-bold '
								: ''}"
						>
							<span class="label-text  text-lg"
								>{choice}
								{#if chosenDefault && chosenDefault.includes(choice)}
									<div class="badge badge-xs  badge-info">default</div>
								{/if}
							</span>

							<input
								type="checkbox"
								name="chosen"
								class="checkbox"
								value={choice}
								bind:group={chosenInternal}
							/>
						</label>
					{/each}
				{/if}
			</div>
		</div>
	</Modal>
{/if}

<style>
	.noStyles {
		all: unset;
	}
</style>
