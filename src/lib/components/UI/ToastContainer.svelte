<script lang="ts">
	import { toast } from '$lib/stores/toastStore';
	import ToastItem from './ToastItem.svelte';
	import { portal } from 'svelte-portal';
	import { browser } from '$app/environment';

	let toasts = $state([]);

	const unsubscribe = toast.subscribe((value) => {
		toasts = value;
	});

    // Clean up subscription if component is destroyed (though MainWraper usually persists)
    import { onDestroy } from 'svelte';
    onDestroy(() => {
        unsubscribe();
    });
</script>

{#if browser}
	<div
		use:portal={'body'}
		class="toast toast-end toast-bottom z-[9999] p-4 flex flex-col items-end gap-2 pointer-events-none"
	>
		<div class="pointer-events-auto">
			{#each toasts as item (item.id)}
				<ToastItem {item} />
			{/each}
		</div>
	</div>
{/if}
