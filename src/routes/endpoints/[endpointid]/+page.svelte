<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	import { page } from '$app/stores';
	$: endpointid = $page.params.endpointid;
</script>

<!-- <div>
	{endpointid}
</div> -->
