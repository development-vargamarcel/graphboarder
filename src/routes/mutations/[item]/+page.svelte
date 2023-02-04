<script>
	import { page } from '$app/stores';
	import Page from '$lib/components/Page.svelte';
	$: item = $page.params.item;
	import MutationExample from '../MutationExample.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
</script>

<Page MenuItem={false} CustomId="fdsfdsee" backPath={`/`} title={$page.params.item}>
	<div class="overflow-auto h-full">
		{#key $page.params.item}
			{#if $page.params.item}
				<QMSWraper QMSName={$page.params.item} QMSType="mutation">
					<MutationExample />
				</QMSWraper>
			{/if}
		{/key}
	</div>
</Page>
