<script>
	import { page } from '$app/stores';
	import Page from '$lib/components/Page.svelte';
	$: item = $page.params.item;
	import MutationExample from '../MutationExample.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
</script>

<Page MenuItem={false} CustomId="fdsfds" backPath={`/`}>
	<div class="overflow-auto h-full">
		{$page.params.item}
		{#key $page.params.item}
			{#if $page.params.item}
				{$page.params.item}
				<QMSWraper QMSName={$page.params.item} QMSType="mutation">
					<MutationExample />
				</QMSWraper>
			{/if}
		{/key}
	</div>
</Page>
