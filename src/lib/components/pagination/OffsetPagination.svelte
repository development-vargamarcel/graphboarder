<script>
	import { offsetBasedPagination_Store } from '$lib/stores/pagination/offsetBasedPagination';
	import { generateNewArgData } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	const { limitPossibleNames, offsetPossibleNames } = $offsetBasedPagination_Store;

	export let prefix = '';
	export let offsetPaginationArguments;
	export const limit = 10;
	export let offset = 0;
	const activeArgumentsDataGrouped_Store = getContext(`${prefix}activeArgumentsDataGrouped_Store`);
	const final_gqlArgObj_Store = getContext(`${prefix}final_gqlArgObj_Store`);

	const offset_argument = offsetPaginationArguments.find((arg) => {
		return offsetPossibleNames.includes(arg.dd_displayName);
	});
	const offset_name = offset_argument.dd_displayName;

	//
	offsetPaginationArguments.forEach((arg) => {
		let isOffsetArg;
		if (arg.dd_displayName == offset_name) {
			isOffsetArg = true;
		}
		if (!activeArgumentsDataGrouped_Store.get_activeArgument([arg.dd_displayName], 'root')) {
			//add limit argument
			activeArgumentsDataGrouped_Store.add_activeArgument(
				generateNewArgData([arg.dd_displayName], arg, {
					chd_chosen: undefined,
					chd_dispatchValue: isOffsetArg ? offset : limit,
					chd_needsChosen: false,
					chd_needsValue: true,
					chd_rawValue: isOffsetArg ? offset : limit,
					inUse: true
				}),
				'root'
			);
		}
	});

	$: {
		activeArgumentsDataGrouped_Store.update_activeArgument(
			Object.assign(activeArgumentsDataGrouped_Store.get_activeArgument([offset_name], 'root'), {
				chd_dispatchValue: offset,
				chd_rawValue: offset
			}),
			'root'
		);
		console.log({ offset });
		final_gqlArgObj_Store.regenerate_groupsAndfinal_gqlArgObj();
	}
	//
	const prevPage = () => {
		offset = offset - limit;
	};
	const nextPage = () => {
		offset = offset + limit;
	};
</script>

<button class="btn btn-xs btn-accent {offset == 0 ? 'btn-disabled' : ''}" on:click={prevPage}>
	prev page
</button>
<button class="btn btn-xs btn-accent" on:click={nextPage}> next page </button>
