<script>
	import { getContext } from 'svelte';

	export let prefix = '';
	export let QMS;
	let limit = 10;
	let offset = 0;

	const paginationState = getContext(`${prefix}paginationState`);
	paginationState.subscribe((val) => {
		limit = val.limit;
		offset = val.offset;
	});
</script>
