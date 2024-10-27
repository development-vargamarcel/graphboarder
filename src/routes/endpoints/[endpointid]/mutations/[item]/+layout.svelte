<script>
	import { page } from '$app/stores';

	import Page from '$lib/components/Page.svelte';
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();

	//console.log({ item });
</script>

<Page
	MenuItem={true}
	CustomId={$page.params.item}
	backPath={`/mutations/${$page.params.queryName}`}
>
	{@render children?.()}
</Page>
