<script lang="ts">
	import MutationExample from './MutationExample.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import Page from '$lib/components/Page.svelte';
	import { Logger } from '$lib/utils/logger';

	let QMSName = $state<string>();
	let input = $state<HTMLInputElement>();
</script>

<Page MenuItem={true} CustomId="fdsfds" backPath={`/`} title="Mutations">
	<div class="overflow-auto h-full">
		<input
			class="input input-xs w-32 m-5"
			type="text"
			bind:this={input}
			onchange={(e) => {
				if (input) {
					QMSName = input.value;
					Logger.debug(QMSName);
					Logger.debug(input.value);
				}
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
