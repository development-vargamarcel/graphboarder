<script lang="ts">
	import MutationExample from './MutationExample.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import Page from '$lib/components/Page.svelte';

	let QMSName;
	let input;
</script>

<Page MenuItem={true} CustomId="fdsfds" backPath={`/`}>
	<div class="overflow-auto h-full">
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
		{#key QMSName}
			{#if QMSName}
				<QMSWraper isOutermostQMSWraper={true} {QMSName} QMSType="mutation">
					<MutationExample />
				</QMSWraper>
			{/if}
		{/key}
	</div>
</Page>
