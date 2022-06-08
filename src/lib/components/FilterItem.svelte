<script>
	import Modal from '$lib/components/Modal.svelte';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, SOURCES, TRIGGERS } from 'svelte-dnd-action';
	import { fade } from 'svelte/transition';
	// notice - fade in works fine but don't add svelte's fade-out (known issue)
	import { cubicIn } from 'svelte/easing';
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
	let chosenNew = [];
	let choisesNew = [];
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

	let choisesWithId;

	choisesWithId = choises.map((choise) => {
		return { id: choise, title: choise };
	});
	import { flip } from 'svelte/animate';
	const flipDurationMs = 200;
	let dragDisabled = true;
	function handleSort(e) {
		choisesWithId = e.detail.items;
		console.log('choisesWithId', choisesWithId);

		chosenNew = [];
		choisesNew = [];
		choisesWithId.forEach((choice) => {
			if (chosenInternal.includes(choice.title)) {
				chosenNew.push(choice.title);
			}
			choisesNew.push(choice.title);
		});
		chosenInternal = chosenNew;
		choises = choisesNew;
		dragDisabled = true;
	}
	const transformDraggedElement = (draggedEl, data, index) => {
		draggedEl.querySelector('.dnd-item').classList.add('bg-accent/20', 'border-2', 'border-accent');
	};

	//
	function handleConsider(e) {
		const {
			items: newItems,
			info: { source, trigger }
		} = e.detail;
		handleSort(e);
		// Ensure dragging is stopped on drag finish via keyboard
		if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
			dragDisabled = true;
		}
	}
	function handleFinalize(e) {
		const {
			items: newItems,
			info: { source }
		} = e.detail;
		handleSort(e);
		// Ensure dragging is stopped on drag finish via pointer (mouse, touch)
		if (source === SOURCES.POINTER) {
			dragDisabled = true;
		}
	}
	function startDrag(e) {
		// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
		e.preventDefault();
		dragDisabled = false;
	}
	function handleKeyDown(e) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
	}
	//
</script>

<btn
	class="btn btn-sm btn-{size} {btnExtraClass}  flex  w-max normal-case"
	on:click|stopPropagation|preventDefault|capture={showModalOrToggle}
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
					<ul
						use:dndzone={{
							items: choisesWithId,
							dragDisabled,
							flipDurationMs,
							transformDraggedElement
						}}
						on:consider={handleSort}
						on:finalize={handleSort}
					>
						{#each choisesWithId as choice (choice.id)}
							<div animate:flip={{ duration: flipDurationMs }} class="relative flex">
								<div
									tabindex={dragDisabled ? 0 : -1}
									aria-label="drag-handle"
									class="bi bi-grip-vertical pt-3 px-2"
									style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
									on:mousedown={startDrag}
									on:touchstart={startDrag}
									on:keydown={handleKeyDown}
								/>
								<div
									class="w-full"
									on:mousedown={() => {
										dragDisabled = true;
									}}
									on:touchstart={() => {
										dragDisabled = true;
									}}
									on:keydown={() => {
										dragDisabled = true;
									}}
								>
									<label
										class="cursor-pointer label  rounded-box my-[1px] transition-all   font-light border-transparent border-[1px] active:border-base-content/50 active:bg-primary/5  duration-75    {chosenInternal?.includes(
											choice.title
										)
											? 'font-extrabold '
											: ''} dnd-item
									"
									>
										<span class="label-text  text-lg">
											{choice.title}

											{#if chosenDefault && chosenDefault.includes(choice.title)}
												<div class="badge badge-xs  badge-info">default</div>
											{/if}
										</span>

										<input
											type="checkbox"
											name="chosen"
											class="checkbox"
											value={choice.title}
											bind:group={chosenInternal}
										/>
									</label>
								</div>

								{#if choice[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
									<div
										in:fade={{ duration: 200, easing: cubicIn }}
										class="rounded-box mx-2 py-5 border-dotted  border-accent/20 border-2 text-primary absolute w-11/12   top-0 left-0 visible"
									/>
								{/if}
							</div>
						{/each}
					</ul>
					<div class="flex space-x-2 pr-2 mt-2" />
				{/if}
			</div>
		</div>
	</Modal>
{/if}

<style>
	.noStyles {
		all: unset;
	}
	.custom-shadow-item {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		visibility: visible;
		border: 1px dashed grey;
		background: lightblue;
		opacity: 0.5;
		margin: 0;
	}
</style>
