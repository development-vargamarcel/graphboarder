<script lang="ts">
	interface Props {
		size?: 'loading-xs' | 'loading-sm' | 'loading-md' | 'loading-lg';
		color?:
			| 'text-primary'
			| 'text-secondary'
			| 'text-accent'
			| 'text-neutral'
			| 'text-info'
			| 'text-success'
			| 'text-warning'
			| 'text-error';
	}

	let { size = 'loading-md', color = 'text-primary' }: Props = $props();
</script>

<div class="flex justify-center items-center p-4">
	<span class="loading loading-spinner {size} {color}"></span>
</div>
