<script>
	import { getContext } from 'svelte';

	export let limit = 10;
	export let offset = 0;
	export let prefix = '';
	export let currentQMS_Info;
	console.log({ currentQMS_Info });
	const activeArgumentsDataGrouped_Store = getContext('activeArgumentsDataGrouped_Store');
	$: console.log(
		'qqqqqqqqq',
		activeArgumentsDataGrouped_Store.get_activeArgument(['limit'], 'root')
	);
	// 	let infoToCast = {
	// 	inputFields,
	// 	enumValues,
	// 	stepsOfFields,
	// 	stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
	// 	id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
	// 	...type
	// };
</script>
