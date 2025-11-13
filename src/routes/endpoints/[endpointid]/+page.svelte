<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	export let data: PageData;
	$: endpointid = $page.params.endpointid;
</script>

<!-- <div>
	{endpointid}
</div> -->
