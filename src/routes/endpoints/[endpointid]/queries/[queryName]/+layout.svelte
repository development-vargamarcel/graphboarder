<script lang="ts">
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import ComponentForLayout from './ComponentForLayout.svelte';
	import { page } from '$app/state';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let queryName = page.params.queryName;
	console.log(queryName);
</script>

{@render children?.()}
<QMSWraper isOutermostQMSWraper={true} QMSName={queryName}>
	<ComponentForLayout />
</QMSWraper>
