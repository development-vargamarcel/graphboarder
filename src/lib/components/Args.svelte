<script>
	import Arg from './Arg.svelte';

	export let args;
</script>

<div class="border-l-2 border-secondary bg-accent/5">
	<div class="">
		{#each args as arg, index}
			<div>
				<Arg {index} type={arg} />
			</div>
		{/each}
	</div>
</div>
