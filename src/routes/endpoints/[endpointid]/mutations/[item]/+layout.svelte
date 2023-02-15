<script>
	import { page } from '$app/stores';

	import Page from '$lib/components/Page.svelte';

	//console.log({ item });
</script>

<Page
	MenuItem={true}
	CustomId={$page.params.item}
	backPath={`/mutations/${$page.params.queryName}`}
>
	<slot />
</Page>
