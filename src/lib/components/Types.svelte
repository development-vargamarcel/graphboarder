<script>
	import Type from './Type.svelte';

	export let whatIsShown;
	export let whatToShow;
</script>

<h1 class="py-2">showing {whatIsShown}</h1>
<ul>
	{#each whatToShow as type, index}
		<Type {index} {type} />
	{/each}
</ul>
