<script lang="ts">
	import MutationExample from './MutationExample.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	let QMSName;
	let input;
</script>

<input
	class="input input-xs w-32 m-5"
	type="text"
	bind:this={input}
	on:change={(e) => {
		QMSName = input.value;
		console.log(QMSName);
		console.log(input.value);
	}}
/>
{#if QMSName}
	<QMSWraper {QMSName} QMSType="mutation">
		<MutationExample />
	</QMSWraper>
{/if}
