<script lang="ts">
	import { run, preventDefault, stopPropagation } from 'svelte/legacy';

	import Modal from '$lib/components/Modal.svelte';
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, SOURCES, TRIGGERS } from 'svelte-dnd-action';
	
	console.log({ chosen });

	let chosenInternal = $state(JSON.parse(JSON.stringify(chosen)));
	let extraInfo = $state('');
	let extraInfoExtraClass = $state('');
	let btnExtraClass = $state();
	let titlePreChange = $state(title);
	let isToggle = $state(false);
	if (choises.length == 1) {
		isToggle = true;
	}
	//choises.length == 1 ? (type = 'toggle') : '';
	let reorder = false;
	let chosenPreChange;
	let modalVisible = $state(false);
	let chosenNew = [];
	let choisesNew = [];
	let choisesWithId = $state();
	let shouldToggle = choises.length == 1;
	let showModalOrToggle = () => {
		//		if (choises.length > 1) {
		if (!shouldToggle) {
			//show modal
			modalVisible = true;
			chosenPreChange = chosen;
			titlePreChange = title;
		} else {
			//toggle
			console.log('pre', { chosen });

			if (type == 'radio') {
				chosen?.length > 0 ? (chosen = undefined) : (chosen = choises[0]);
				//chosen = [choises[0]];
			} else {
				chosen?.length > 0 ? (chosen = undefined) : (chosen = choises);
			}
			//chosen.length == 1 ? (chosen = []) : (chosen = choises);
			console.log({ chosen });
			applyFilter();
		}
	};
	choisesWithId = choises.map((choise) => {
		return { id: choise, title: choise };
	});
	let hideModal = () => {
		chosen = chosenPreChange;
		chosenInternal = chosen;
		modalVisible = false;
	};
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let applyFilter = () => {
		if (!shouldToggle) {
			modalVisible = false;
			chosen = chosenInternal;
		}
		//console.log('filterApplied', { id: id, chosen: chosen, extraData });
		dispatch('filterApplied', { id: id, chosen: chosen, extraData, choises: choises });
	};


	import { flip } from 'svelte/animate';
	interface Props {
		// notice - fade in works fine but don't add svelte's fade-out (known issue)
		extraData: any;
		id: any;
		choises?: any;
		title?: any;
		modalTitle?: any;
		type?: string;
		size?: string;
		chosenDefault: any;
		defaultMeansNoChange?: boolean;
		chosen?: any;
		children?: import('svelte').Snippet;
	}

	let {
		extraData,
		id,
		choises = $bindable(['']),
		title = $bindable(choises[0]),
		modalTitle = title,
		type = 'radio',
		size = 'xs',
		chosenDefault,
		defaultMeansNoChange = true,
		chosen = $bindable(chosenDefault ? JSON.parse(JSON.stringify(chosenDefault)) : []),
		children
	}: Props = $props();
	const flipDurationMs = 200;
	let dragDisabled = $state(true);

	const syncOrder = () => {
		chosenNew = [];
		choisesNew = [];
		choisesWithId.forEach((choice) => {
			if (chosenInternal?.includes(choice.title)) {
				chosenNew.push(choice.title);
			}
			choisesNew.push(choice.title);
		});
		chosenInternal = chosenNew;
		choises = choisesNew;
	};

	function handleSort(e) {
		choisesWithId = e.detail.items;
		//console.log('choisesWithId', choisesWithId);
		syncOrder();

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
	run(() => {
		if (title) {
			if (type == 'toggle') {
				title = chosen;
			} else {
				type == 'radio' ? (title = chosen) : (extraInfo = `${chosen?.length}`);
			}
		}
	});
	run(() => {
		if (chosen?.length > 0) {
			if (type !== 'radio') {
				syncOrder();
			}
			//console.log('chosen:', chosen);
			//console.log('chosenInternal:', chosenInternal);
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
			//console.log('chosen:', chosen);
			//console.log('chosenInternal:', chosenInternal);
			if (!modalVisible) {
				chosenInternal = chosen;
			}
			btnExtraClass =
				'btn-outline btn-neutral bg-primary/10 hover:bg-primary/10 hover:text-base-content';
			if (isToggle) {
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
			if (type !== 'radio') {
				syncOrder();
			}
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<btn
	class="btn  btn-{size} {btnExtraClass}  flex  w-full normal-case"
	onclickcapture={stopPropagation(preventDefault(showModalOrToggle))}
>
	{isToggle ? choises[0] : title}

	{#if extraInfo && !isToggle}
		<div
			class="ml-2 space-y-0 border  leading-3 {extraInfoExtraClass} rounded-box  flex space-x-1 px-1"
		>
			<p class=" mx-auto pt-[1px] my-0 p-0 text-xs leading-3 text-primary-content">
				{extraInfo}
			</p>
			<p></p>
			<i class="bi bi-chevron-down  mx-auto pt-[1px] my-0 p-0 text-xs leading-3"></i>
		</div>
	{/if}

	{#if !isToggle && !extraInfo}
		<i class="bi bi-chevron-down ml-2 text-xs"></i>
	{/if}
</btn>
{#if modalVisible}
	<Modal on:apply={applyFilter} on:cancel={hideModal}>
		<div class="rounded-box overflow-hidden ">
			<div class="form-control px-2 mt-2 pt-2">
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
						onconsider={handleSort}
						onfinalize={handleSort}
						class="rounded-box"
					>
						{#each choisesWithId as choice (choice.id)}
							<div animate:flip={{ duration: flipDurationMs }} class="relative flex">
								<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
								<div
									tabindex={dragDisabled ? 0 : -1}
									aria-label="drag-handle"
									class="bi bi-grip-vertical pt-3 px-2"
									style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
									onmousedown={startDrag}
									ontouchstart={startDrag}
									onkeydown={handleKeyDown}
								></div>
								<div
									class="w-full"
									onmousedown={() => {
										dragDisabled = true;
									}}
									ontouchstart={() => {
										dragDisabled = true;
									}}
									onkeydown={() => {
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
										class="ml-8 rounded-box mx-2 py-5 border-dotted  border-accent/20 border-2 text-primary absolute w-11/12   top-0 left-0 visible"
									></div>
								{/if}
							</div>
						{/each}
					</ul>
					<div class="flex space-x-2 pr-2 mt-10"></div>
				{/if}
			</div>
			<div class="alert alert-info shadow-lg py-2 mt-2 text-md  ">
				<div class="flex space-x-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="stroke-current flex-shrink-0 w-6 h-6 my-auto"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
					<div>
						{@render children?.()}
					</div>
				</div>
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
