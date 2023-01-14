<script>
	import { createEventDispatcher, getContext } from 'svelte';
	import FilterItem from '../FilterItem.svelte';
	const dispatch = createEventDispatcher();
	const endpointInfo = getContext('endpointInfo');
	const possible_displayInterfaces = $endpointInfo.typesExtraDataPossibilities.map(
		(possibility) => {
			return possibility.get_Val()?.displayInterface;
		}
	);
</script>

<FilterItem
	title="pick an interface"
	choises={possible_displayInterfaces.filter((displayInterface) => {
		return displayInterface;
	})}
	on:filterApplied={(e) => {
		dispatch('interfaceChosen', { chosen: e.detail.chosen });
		console.log(e.detail);
	}}
/>
