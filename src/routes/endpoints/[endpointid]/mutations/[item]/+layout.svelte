<script lang="ts">
	import { page } from '$app/state';

	import Page from '$lib/components/Page.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	//console.log({ item });
</script>

<Page
	MenuItem={true}
	CustomId={page.params.item}
	backPath={`/mutations/${page.params.queryName}`}
>
	{@render children?.()}
</Page>
