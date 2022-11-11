<script>
	import { Check_supportsOffsetPagination } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';

	export let limit = 10;
	export let offset = 0;
	export let prefix = '';
	export let currentQMS_Info;
	let args = currentQMS_Info.args;

	let OffsetPaginationSupport = Check_supportsOffsetPagination(args);
	console.log({ OffsetPaginationSupport });
	console.log({ currentQMS_Info });
	const activeArgumentsDataGrouped_Store = getContext(`${prefix}activeArgumentsDataGrouped_Store`);

	const final_gqlArgObj_Store = getContext(`${prefix}final_gqlArgObj_Store`);

	const generateNewArgData = (stepsOfFields, type, extraData = {}) => {
		let infoToCast = {
			stepsOfFields,
			stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
			id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
			...type,
			...extraData
		};
		return infoToCast;
	};

	if (!activeArgumentsDataGrouped_Store.get_activeArgument(['limit'], 'root')) {
		//add limit argument
		activeArgumentsDataGrouped_Store.add_activeArgument(
			generateNewArgData(
				['limit'],
				args.find((arg) => {
					return arg.dd_displayName == 'limit';
				}),
				{
					chd_chosen: undefined,
					chd_dispatchValue: limit,
					chd_needsChosen: false,
					chd_needsValue: true,
					chd_rawValue: limit,
					inUse: true
				}
			),
			'root'
		);
	}

	if (!activeArgumentsDataGrouped_Store.get_activeArgument(['offset'], 'root')) {
		//add offset argument

		activeArgumentsDataGrouped_Store.add_activeArgument(
			generateNewArgData(
				['offset'],
				args.find((arg) => {
					return arg.dd_displayName == 'offset';
				}),
				{
					chd_chosen: undefined,
					chd_dispatchValue: offset,
					chd_needsChosen: false,
					chd_needsValue: true,
					chd_rawValue: offset,
					inUse: true
				}
			),
			'root'
		);
	}
	//final_gqlArgObj_Store.regenerate_groupsAndfinal_gqlArgObj(); //commented,will run on offset change anyways s
	$: {
		activeArgumentsDataGrouped_Store.update_activeArgument(
			Object.assign(activeArgumentsDataGrouped_Store.get_activeArgument(['offset'], 'root'), {
				chd_dispatchValue: offset,
				chd_rawValue: offset
			}),
			'root'
		);
		console.log({ offset });
		final_gqlArgObj_Store.regenerate_groupsAndfinal_gqlArgObj();
	}
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
