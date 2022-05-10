<script>
	import FilterItem from './FilterItem.svelte';
	import FilterChoises from './FilterChoises.svelte';

	export let id;
	export let choises;
	export let title;
	export let modalTitle = title;
	export let type;
	export let chosenDefault;
	export let chosen;
</script>

<FilterItem
	{id}
	{choises}
	{title}
	{modalTitle}
	{type}
	{chosenDefault}
	{chosen}
	on:filterApplied={(e) => {
		let { detail } = e;

		console.log('detail', detail);
	}}
/>
