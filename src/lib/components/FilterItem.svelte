<script>
	import Modal from '$lib/components/Modal.svelte';
	export let extraData;
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
	let reorder = false;
	let selectedForEdit = [];
	$: console.log('selectedForEdit', selectedForEdit);
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
		console.log('filterApplied', { id: id, chosen: chosen, extraData });
		dispatch('filterApplied', { id: id, chosen: chosen, extraData, choises: choises });
		selectedForEdit = [];
		reorder = false;
	};
	$: if (title) {
		if (type == 'toggle') {
			title = chosen;
		} else {
			type == 'radio' ? (title = chosen) : (extraInfo = `${chosen?.length}`);
		}
	}

	$: if (chosen?.length > 0) {
		console.log('chosen:', chosen);
		console.log('chosenInternal:', chosenInternal);
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
		console.log('chosen:', chosen);
		console.log('chosenInternal:', chosenInternal);
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

	const moveUp = () => {
		chosenInternal = [];
		choises.forEach((el, index, array) => {
			if (selectedForEdit.includes(el) && index > 0) {
				let elToSubstitute = array[index - 1];
				if (!selectedForEdit.includes(elToSubstitute)) {
					array[index] = elToSubstitute;
					array[index - 1] = el;
				}
			}
		});

		choises = choises;
		chosen = chosenInternal;
		//selectedForEdit = selectedForEdit;
	};
	const moveDown = () => {};
</script>

<btn
	class="btn btn-sm btn-{size} {btnExtraClass}  flex  w-max normal-case"
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
	<Modal on:apply={applyFilter} on:cancel={hideModal}>
		<div class="rounded-box overflow-hidden border-2 border-base-300 bg-base-100 pb-3 ">
			<h4 class="mb-3 overflow-hidden bg-base-300 py-1 pl-2 text-xl ">{modalTitle}</h4>
			<div class="form-control px-2">
				{#if type == 'radio'}
					{#each choises as choice}
						<label
							class="label rounded-box  cursor-pointer   border-2 border-dotted  border-transparent font-light transition  active:border-base-content/50 active:bg-primary/5 {chosenInternal ==
							choice
								? 'font-extrabold '
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
					{#key choises}
						{#each choises as choice (choice)}
							<label
								class="cursor-pointer label  rounded-box   transition font-light border-2 border-dotted border-transparent  active:border-base-content/50 active:bg-primary/5 {chosenInternal?.includes(
									choice
								)
									? 'font-extrabold '
									: ''}"
							>
								<input
									type="checkbox"
									name="selectedForEdit"
									class="checkbox {reorder ? 'block' : 'hidden'}"
									value={choice}
									bind:group={selectedForEdit}
								/>

								<span class="label-text  text-lg">
									{choice}
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
					{/key}
					<div class="flex space-x-2 pr-2 mt-2">
						<button
							class="btn btn-xs {reorder ? 'btn-accent w-1/2' : 'btn-primary w-full'}  "
							on:click={() => {
								reorder = !reorder;
							}}>{reorder ? 'done' : 'reorder'}</button
						>
						{#if reorder}
							<div class="w-1/2 flex space-x-2">
								<button class="btn btn-xs   w-1/2" on:click={moveUp}
									><i class="bi bi-arrow-up-short" />up</button
								>
								<button class="btn btn-xs   w-1/2" on:click={moveDown}
									><i class="bi bi-arrow-down-short" />down</button
								>
							</div>
						{/if}
					</div>
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
