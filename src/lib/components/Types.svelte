<script>
	import Type from './Type.svelte';

	export let whatIsShown;
	export let whatToShow = '';
</script>

<div class="border-l-2">
	{#if whatIsShown !== ''}
		<h1
			class="py-1 my-1 px-2 bg-base-content rounded-r-full text-base-300 text-center text-md w-1/2"
		>
			showing {whatIsShown}
		</h1>
	{/if}

	<ul>
		{#each whatToShow as type, index (index + whatIsShown)}
			<Type {index} {type} />
		{/each}
	</ul>
</div>
