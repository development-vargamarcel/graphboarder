<script>
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import ComponentForLayout from './ComponentForLayout.svelte';
	import { page } from '$app/stores';

	let queryName = $page.params.queryName;
	console.log(queryName);
</script>

<slot />
<QMSWraper isOutermostQMSWraper={true} QMSName={queryName}>
	<ComponentForLayout />
</QMSWraper>
