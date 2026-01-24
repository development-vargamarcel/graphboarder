<script lang="ts">
	interface Props {
		message?: string;
		icon?: string;
	}

	let { message = 'No data found', icon = 'bi-inbox' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center p-8 text-base-content/50">
	<i class="bi {icon} text-4xl mb-2"></i>
	<p class="text-lg font-medium">{message}</p>
</div>
