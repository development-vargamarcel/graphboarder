<script>
	import { Create_offsetBasedPaginationState } from './../../stores/pagination/offsetBasedPaginationState.ts';
	import { generateNewArgData } from '$lib/utils/usefulFunctions';
	import { getContext, setContext } from 'svelte';

	export let prefix = '';
	export let limit = 10;
	export let offset = 0;
	export let QMS;
	const activeArgumentsDataGrouped_Store = getContext(`${prefix}activeArgumentsDataGrouped_Store`);
	const final_gqlArgObj_Store = getContext(`${prefix}final_gqlArgObj_Store`);
	const { offsetArg, limitArg } = QMS.offsetPaginationArgs;
	const offsetName = offsetArg.dd_displayName;
	const limitName = limitArg.dd_displayName;

	const offsetBasedPaginationState = Create_offsetBasedPaginationState({
		limit,
		offset
	});
	setContext(`${prefix}offsetBasedPaginationState`, offsetBasedPaginationState);
	offsetBasedPaginationState.subscribe((val) => {
		limit = val.limit;
		offset = val.offset;
	});
	//

	Object.values(QMS.offsetPaginationArgs).forEach((arg) => {
		let isOffsetArg;
		if (arg.dd_displayName == offsetName) {
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
			Object.assign(activeArgumentsDataGrouped_Store.get_activeArgument([offsetName], 'root'), {
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
		// $offsetBasedPaginationState.offset =
		// 	$offsetBasedPaginationState.offset - $offsetBasedPaginationState.limit;
		$offsetBasedPaginationState.offset = offset - limit;
	};
	const nextPage = () => {
		// $offsetBasedPaginationState.offset =
		// 	$offsetBasedPaginationState.offset + $offsetBasedPaginationState.limit;
		$offsetBasedPaginationState.offset = offset + limit;
	};
</script>

<button class="btn btn-xs btn-accent {offset == 0 ? 'btn-disabled' : ''}" on:click={prevPage}>
	prev page
</button>
<button class="btn btn-xs btn-accent" on:click={nextPage}> next page </button>
