<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let endpointid = $derived($page.params.endpointid);
</script>

<!-- <div>
	{endpointid}
</div> -->
