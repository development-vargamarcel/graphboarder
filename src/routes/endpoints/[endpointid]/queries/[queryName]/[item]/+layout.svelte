<script>
	import { page } from '$app/stores';

	import Page from '$lib/components/Page.svelte';

	let item = $page.params.item;
	//console.log({ item });
</script>

<Page
	MenuItem={false}
	CustomId={item}
	backPath={`/queries/${$page.params.queryName}`}
	title={$page.params.item}
>
	<div class="p-2">
		<slot />
	</div>
</Page>
