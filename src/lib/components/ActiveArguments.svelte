<script lang="ts">
	import { activeArgumentsDataGrouped_Store } from './../stores/activeArgumentsDataGrouped_Store.ts';
	import { generate_FINAL_gqlArgObj_fromGroups } from './../utils/usefulFunctions.ts';

	import { createEventDispatcher, each, setContext } from 'svelte/internal';

	import Modal from './Modal.svelte';
	import ActiveArgumentsGroup from './ActiveArgumentsGroup.svelte';
	let activeArgumentsDataGrouped = [];
	$: console.log({ activeArgumentsDataGrouped });
	const update_activeArgumentsDataGrouped = (groupNewData) => {
		activeArgumentsDataGrouped_Store.update_groups(groupNewData);

		console.log({ groupNewData });
		let index = activeArgumentsDataGrouped.findIndex((group) => {
			return group.group_name == groupNewData.group_name;
		});
		activeArgumentsDataGrouped[index] = groupNewData;
		activeArgumentsDataGrouped = activeArgumentsDataGrouped;
		//console.log('groupNewData.group_args', groupNewData.group_args);
		//console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
	};
	let showActiveFilters;
	const dispatch = createEventDispatcher();
	let showModal = false;
	export let overwrite_activeArgumentsData;
	export let delete_activeArgument;
	export let argsInfo;
	//console.log('argsInfo', argsInfo);
	const handleArgsChanged = () => {};

	const generate_final_gqlArgObj = () => {
		let { final_gqlArgObj, final_gqlArgObj_string, final_canRunQuery } =
			generate_FINAL_gqlArgObj_fromGroups(activeArgumentsDataGrouped);
		if (final_canRunQuery) {
			dispatch('argsChanged', {
				gqlArgObj: final_gqlArgObj,
				gqlArgObj_string: final_gqlArgObj_string
			});
		}
	};

	//handle generating activeArgumentsDataGrouped
	let rootGroup = { group_name: 'root', group_isRoot: true, dd_kindList: false, group_args: [] };
	activeArgumentsDataGrouped = [rootGroup];

	argsInfo?.forEach((el) => {
		//console.log('el---', el);
		if (!el.dd_isRootArg) {
			let newGroupData = {
				group_name: el.dd_displayName,
				group_isRoot: false,
				// group_info: el,
				...el,
				group_args: []
			};

			const hasFilterOperators = el.dd_relatedRoot?.dd_filterOperators?.length > 0;

			if (hasFilterOperators) {
				newGroupData.group_argsNode = {
					mainContainer: {
						operator: '_and',
						isMain: true,
						not: false,
						items: [],
						id: 'mainContainer'
					}
				};
			}

			activeArgumentsDataGrouped.push(newGroupData);
		}
	});

	//console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);

	//

	/////generate gqlArgObj to be used in query

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

				{#each activeArgumentsDataGrouped as group}
					<ActiveArgumentsGroup
						on:updateQuery={() => {
							generate_final_gqlArgObj();
						}}
						{update_activeArgumentsDataGrouped}
						{group}
						{argsInfo}
						{overwrite_activeArgumentsData}
						{showDescription}
						{delete_activeArgument}
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
