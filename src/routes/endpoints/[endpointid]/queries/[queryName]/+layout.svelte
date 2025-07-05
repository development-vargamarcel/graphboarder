<script>
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import ComponentForLayout from './ComponentForLayout.svelte';
	import { page } from '$app/state';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();

	let queryName = page.params.queryName;
	console.log(queryName);
</script>

{@render children?.()}
<QMSWraper isOutermostQMSWraper={true} QMSName={queryName}>
	<ComponentForLayout />
</QMSWraper>
