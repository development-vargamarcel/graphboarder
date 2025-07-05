<script>
	import { page } from '$app/state';

	import Page from '$lib/components/Page.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();

	let item = page.params.item;
	//console.log({ item });
</script>

<Page
	MenuItem={false}
	CustomId={item}
	backPath={`/queries/${page.params.queryName}`}
	title={page.params.item}
>
	<div class="p-2">
		{@render children?.()}
	</div>
</Page>
