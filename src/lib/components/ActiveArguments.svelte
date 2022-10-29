<script lang="ts">
	import { Create_activeArgumentsDataGrouped_Store } from './../stores/activeArgumentsDataGrouped_Store.ts';
	import { generate_FINAL_gqlArgObj_fromGroups } from './../utils/usefulFunctions.ts';
	const fulfilledQuery_Store = getContext('fulfilledQuery_Store');
	import { createEventDispatcher, each, getContext, setContext } from 'svelte/internal';
	let activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store();
	import Modal from './Modal.svelte';
	import ActiveArgumentsGroup from './ActiveArgumentsGroup.svelte';
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

	const generate_final_gqlArgObj = () => {
		let { final_gqlArgObj, final_gqlArgObj_string, final_canRunQuery } =
			generate_FINAL_gqlArgObj_fromGroups($activeArgumentsDataGrouped_Store);
		if (final_canRunQuery) {
			fulfilledQuery_Store.updateDataSmart(final_gqlArgObj_string, false);
			dispatch('argsChanged', {
				gqlArgObj: final_gqlArgObj,
				gqlArgObj_string: final_gqlArgObj_string
			});
		}
	};

	setContext('activeArgumentsDataGrouped_Store', activeArgumentsDataGrouped_Store);
	activeArgumentsDataGrouped_Store.set_groups(activeArgumentsDataGrouped, argsInfo);
	activeArgumentsDataGrouped_Store.subscribe((activeArgumentsDataGrouped_Store) => {
		console.log({ activeArgumentsDataGrouped_Store });
	});
	generate_final_gqlArgObj();

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
					<ActiveArgumentsGroup
						on:updateQuery={() => {
							generate_final_gqlArgObj();
						}}
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
