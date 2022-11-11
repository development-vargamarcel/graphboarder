<script>
	import { getContext } from 'svelte';

	export let limit = 10;
	export let offset = 0;
	export let prefix = '';
	const activeArgumentsDataGrouped_Store = getContext('activeArgumentsDataGrouped_Store');
</script>
