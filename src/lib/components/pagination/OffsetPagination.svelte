<script>
	import { getContext } from 'svelte';

	export let limit = 10;
	export let offset = 0;
	export let prefix = '';
	export let currentQMS_Info;
	let args = currentQMS_Info.args;
	console.log({ currentQMS_Info });
	const activeArgumentsDataGrouped_Store = getContext(`${prefix}activeArgumentsDataGrouped_Store`);
	let infoToCast;
	let stepsOfFields;
	let activeArgumentsDataGrouped_Store_IS_SET = false;
	$: activeArgumentsDataGrouped_Store_IS_SET =
		$activeArgumentsDataGrouped_Store.length > 0 ? true : false;

	$: {
		if (activeArgumentsDataGrouped_Store_IS_SET) {
			if (!activeArgumentsDataGrouped_Store.get_activeArgument(['limit'], 'root')) {
				//add limit argument
				stepsOfFields = ['limit'];
				infoToCast = {
					// inputFields,
					// enumValues,
					stepsOfFields,
					stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
					id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
					...args.find((arg) => {
						return arg.dd_displayName == stepsOfFields[0];
					})
				};
				activeArgumentsDataGrouped_Store.add_activeArgument(infoToCast, 'root');
			}
			if (!activeArgumentsDataGrouped_Store.get_activeArgument(['offset'], 'root')) {
				//add offset argument
				stepsOfFields = ['offset'];
				infoToCast = {
					// inputFields,
					// enumValues,
					stepsOfFields,
					stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
					id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
					...args.find((arg) => {
						return arg.dd_displayName == stepsOfFields[0];
					})
				};
				activeArgumentsDataGrouped_Store.add_activeArgument(infoToCast, 'root');
			}
		}
	}
</script>
