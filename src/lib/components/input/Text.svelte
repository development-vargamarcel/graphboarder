<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	let rawValue;

	$: if (rawValue) {
		dispatch('changed', { value: rawValue });
	}
</script>

<input type="text" class="input input-primary input-xs w-40 mr-2" bind:value={rawValue} />
