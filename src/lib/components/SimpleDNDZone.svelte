<script>
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	const flipDurationMs = 200;
	function handleSort(e) {}
	let handleConsider = () => {
		console.log('aaaaaaaaaaaa');
	};
	let items = [];
	export let type = '';
</script>

<section
	class="h-10 w-full"
	use:dndzone={{ items, flipDurationMs, type }}
	on:consider={handleConsider}
	on:finalize={handleSort}
/>

<style>
	div {
		height: 1.5em;
		width: 10em;
		text-align: center;
		border: 1px solid black;
		margin: 0.2em;
		padding: 0.3em;
	}
</style>
