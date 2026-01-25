<script lang="ts">
	import { queryHistory, removeFromHistory, clearHistory } from '$lib/stores/queryHistory';
	import type { HistoryItem } from '$lib/stores/queryHistory';

	interface Props {
		onRestore: (item: HistoryItem) => void;
		onClose: () => void;
	}

	let { onRestore, onClose }: Props = $props();

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="button" tabindex="0" onclick={onClose}>
	<div
		class="bg-base-100 w-full max-w-3xl h-[80vh] rounded-box flex flex-col shadow-xl"
        role="button"
        tabindex="0"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="p-4 border-b border-base-300 flex justify-between items-center">
			<h3 class="text-xl font-bold">Query History</h3>
			<div class="flex space-x-2">
				{#if $queryHistory.length > 0}
					<button class="btn btn-sm btn-error btn-outline" onclick={clearHistory}>
						Clear All
					</button>
				{/if}
				<button class="btn btn-sm btn-ghost" onclick={onClose}>✕</button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-4 space-y-4">
			{#if $queryHistory.length === 0}
				<div class="text-center text-base-content/50 py-10">No history yet.</div>
			{:else}
				{#each $queryHistory as item (item.id)}
					<div class="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
						<div class="card-body p-4">
							<div class="flex justify-between items-start mb-2">
								<div>
									<h4 class="font-bold">{item.operationName}</h4>
									<div class="text-xs text-base-content/70">{formatDate(item.timestamp)}</div>
									{#if item.rowsCount !== undefined}
										<div class="text-xs badge badge-sm mt-1">{item.rowsCount} rows</div>
									{/if}
								</div>
								<div class="flex space-x-2">
									<button class="btn btn-sm btn-primary" onclick={() => onRestore(item)}>
										Restore
									</button>
									<button
										class="btn btn-sm btn-ghost text-error"
										aria-label="Delete"
										onclick={() => removeFromHistory(item.id)}
									>
										<i class="bi bi-trash"></i>
									</button>
								</div>
							</div>
							<div
								class="bg-base-300 rounded p-2 max-h-32 overflow-hidden text-xs font-mono relative group"
							>
								<pre>{item.query}</pre>
								<div
									class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base-300 pointer-events-none"
								></div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
