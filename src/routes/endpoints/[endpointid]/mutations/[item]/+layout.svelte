<script>
	import { page } from '$app/state';

	import Page from '$lib/components/Page.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();

	//console.log({ item });
</script>

<Page
	MenuItem={true}
	CustomId={page.params.item}
	backPath={`/mutations/${page.params.queryName}`}
>
	{@render children?.()}
</Page>
