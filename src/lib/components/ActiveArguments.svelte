<script lang="ts">
	import { createEventDispatcher, each, getContext, setContext } from 'svelte/internal';
	import Modal from './Modal.svelte';
	import ActiveArgumentsGroupWraper from './ActiveArgumentsGroupWraper.svelte';
	let activeArgumentsDataGrouped_Store = getContext('activeArgumentsDataGrouped_Store');
	let activeArgumentsDataGrouped = [];
	$: console.log({ activeArgumentsDataGrouped });
	const update_activeArgumentsDataGrouped = (groupNewData) => {
		activeArgumentsDataGrouped_Store.update_groups(groupNewData);
	};
	let showActiveFilters;
	const dispatch = createEventDispatcher();
	let showModal = false;
	export let argsInfo;

	const handleArgsChanged = () => {};

	activeArgumentsDataGrouped_Store.set_groups(argsInfo);
	activeArgumentsDataGrouped_Store.subscribe((activeArgumentsDataGrouped_Store) => {
		console.log({ activeArgumentsDataGrouped_Store });
	});

	let showDescription = null;
</script>

{#if showModal}
	<Modal
		modalIdetifier={'activeArgumentsDataModal'}
		showApplyBtn={false}
		on:cancel={(e) => {
			let { detail } = e;
			if (detail.modalIdetifier == 'activeArgumentsDataModal') {
				showModal = false;
			}
		}}
		on:apply={(e) => {
			//console.log(']]]]]]]]]', e);
		}}
		><div class="  w-full  ">
			<div class="mx-auto mt-2  w-full   space-y-2   pb-2  ">
				<div class="w-2" />

				{#each $activeArgumentsDataGrouped_Store as group}
					<ActiveArgumentsGroupWraper
						on:updateQuery={() => {}}
						{update_activeArgumentsDataGrouped}
						{group}
						{argsInfo}
						{showDescription}
						{activeArgumentsDataGrouped}
					/>
				{/each}

				<div class="w-2" />
			</div>
		</div>
	</Modal>
{/if}

<div class="flex space-x-2 mb-2 px-2">
	<button
		class="btn btn-xs btn-block  "
		on:click={() => {
			showModal = !showModal;
			//showActiveFilters = !showActiveFilters;
			showActiveFilters = true;
		}}
		><i class="bi bi-funnel-fill" />
	</button>
</div>
