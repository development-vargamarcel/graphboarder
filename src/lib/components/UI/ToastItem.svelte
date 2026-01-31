<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { toast } from '$lib/stores/toastStore';
	import type { ToastMessage } from '$lib/stores/toastStore';

	interface Props {
		item: ToastMessage;
	}

	let { item }: Props = $props();

	let progress = $state(100);

	onMount(() => {
		if (item.timeout) {
			const interval = setInterval(() => {
				progress -= 100 / (item.timeout! / 100);
				if (progress <= 0) {
					clearInterval(interval);
				}
			}, 100);
			return () => clearInterval(interval);
		}
	});

	const remove = () => {
		toast.remove(item.id);
	};

	let alertClass = $derived.by(() => {
		switch (item.type) {
			case 'info':
				return 'alert-info';
			case 'success':
				return 'alert-success';
			case 'warning':
				return 'alert-warning';
			case 'error':
				return 'alert-error';
			default:
				return 'alert-info';
		}
	});

	let iconClass = $derived.by(() => {
		switch (item.type) {
			case 'info':
				return 'bi-info-circle';
			case 'success':
				return 'bi-check-circle';
			case 'warning':
				return 'bi-exclamation-triangle';
			case 'error':
				return 'bi-x-circle';
			default:
				return 'bi-info-circle';
		}
	});
</script>

<div
	class="alert {alertClass} shadow-lg mb-2 flex justify-between items-start relative overflow-hidden"
	transition:fly={{ y: 20, duration: 300 }}
	role="alert"
>
	<div class="flex items-center gap-2">
		<i class="bi {iconClass} text-xl"></i>
		<span class="break-words max-w-[250px] text-sm">{item.message}</span>
	</div>
	<button class="btn btn-xs btn-ghost btn-circle" onclick={remove} aria-label="Close">
		<i class="bi bi-x"></i>
	</button>
	{#if item.timeout}
		<div
			class="absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all duration-100 ease-linear"
			style="width: {progress}%"
		></div>
	{/if}
</div>
