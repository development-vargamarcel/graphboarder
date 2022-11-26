<script>
	import { getContext } from 'svelte';

	export let prefix = '';
	export let QMS;
	let limit = 10;
	let offset = 0;

	const offsetBasedPaginationState = getContext(`${prefix}offsetBasedPaginationState`);
	offsetBasedPaginationState.subscribe((val) => {
		limit = val.limit;
		offset = val.offset;
	});
</script>
