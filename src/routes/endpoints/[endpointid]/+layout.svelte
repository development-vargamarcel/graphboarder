<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	import { page } from '$app/stores';
	$: endpointid = $page.params.endpointid;
</script>

<div>
	{endpointid}
</div>

<slot><!-- optional fallback --></slot>
