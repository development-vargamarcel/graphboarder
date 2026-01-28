<script lang="ts">
	import {
		queryHistory,
		removeFromHistory,
		clearHistory,
		toggleFavorite,
		updateHistoryItem,
		exportHistory,
		importHistory
	} from '$lib/stores/queryHistory';
	import type { HistoryItem } from '$lib/stores/queryHistory';
	import { Logger } from '$lib/utils/logger';

	/**
	 * Props for QueryHistory component
	 */
	interface Props {
		/** Callback when a history item is restored */
		onRestore: (item: HistoryItem) => void;
		/** Callback when the modal is closed */
		onClose: () => void;
	}

	let { onRestore, onClose }: Props = $props();

	let fileInput: HTMLInputElement;

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	const handleExport = () => {
		Logger.info('Exporting query history');
		const json = exportHistory();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `query-history-${new Date().toISOString().slice(0, 10)}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleImport = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				if (result) {
					Logger.info('Importing query history');
					importHistory(result);
				}
			};
			reader.readAsText(file);
		}
		target.value = ''; // Reset
	};

	// Sort: Favorites first, then by timestamp descending
	let sortedHistory = $derived(
		[...$queryHistory].sort((a, b) => {
			if (a.isFavorite === b.isFavorite) {
				return b.timestamp - a.timestamp;
			}
			return a.isFavorite ? -1 : 1;
		})
	);

	let editingId = $state<string | null>(null);
	let editingName = $state('');

	const startEditing = (item: HistoryItem) => {
		editingId = item.id;
		editingName = item.name || item.operationName;
	};

	const saveName = (id: string) => {
		if (editingName.trim()) {
			updateHistoryItem(id, { name: editingName.trim() });
		}
		editingId = null;
	};

	const focus = (el: HTMLElement) => {
		el.focus();
	};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
	role="button"
	tabindex="0"
	onclick={onClose}
>
	<div
		class="bg-base-100 w-full max-w-3xl h-[80vh] rounded-box flex flex-col shadow-xl"
		role="button"
		tabindex="0"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="p-4 border-b border-base-300 flex justify-between items-center">
			<h3 class="text-xl font-bold">Query History</h3>
			<div class="flex space-x-2 items-center">
				<input
					type="file"
					accept=".json"
					class="hidden"
					bind:this={fileInput}
					onchange={handleImport}
				/>
				<button
					class="btn btn-sm btn-ghost"
					onclick={() => fileInput.click()}
					aria-label="Import History"
				>
					<i class="bi bi-upload"></i> Import
				</button>
				<button class="btn btn-sm btn-ghost" onclick={handleExport} aria-label="Export History">
					<i class="bi bi-download"></i> Export
				</button>
				{#if $queryHistory.length > 0}
					<button
						class="btn btn-sm btn-error btn-outline"
						onclick={() => {
							Logger.info('Clearing all query history');
							clearHistory();
						}}
					>
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
				{#each sortedHistory as item (item.id)}
					<div
						class="card bg-base-200 shadow-sm hover:shadow-md transition-shadow border-l-4 {item.isFavorite
							? 'border-primary'
							: 'border-transparent'}"
					>
						<div class="card-body p-4">
							<div class="flex justify-between items-start mb-2">
								<div class="flex-1 mr-4">
									<div class="flex items-center space-x-2 group/title">
										{#if editingId === item.id}
											<input
												class="input input-sm input-bordered w-full max-w-xs"
												bind:value={editingName}
												onkeydown={(e) => e.key === 'Enter' && saveName(item.id)}
												onblur={() => saveName(item.id)}
												use:focus
											/>
										{:else}
											<button
												class="font-bold cursor-pointer hover:underline text-left"
												onclick={() => startEditing(item)}
											>
												{item.name || item.operationName || 'Untitled Query'}
												{#if !item.name && !item.operationName}<span
														class="text-xs italic text-base-content/50">(No name)</span
													>{/if}
											</button>
											<button
												class="btn btn-xs btn-ghost btn-circle opacity-0 group-hover/title:opacity-100"
												onclick={() => startEditing(item)}
												aria-label="Edit Name"
											>
												<i class="bi bi-pencil"></i>
											</button>
										{/if}
									</div>

									<div class="text-xs text-base-content/70 mt-1 flex items-center space-x-2">
										<span>{formatDate(item.timestamp)}</span>
										{#if item.endpointId}
											<span class="badge badge-xs badge-outline">{item.endpointId}</span>
										{/if}
									</div>
									{#if item.rowsCount !== undefined}
										<div class="text-xs badge badge-sm mt-1">{item.rowsCount} rows</div>
									{/if}
								</div>
								<div class="flex space-x-2">
									<button
										class="btn btn-sm btn-ghost {item.isFavorite
											? 'text-warning'
											: 'text-base-content/30'}"
										onclick={() => toggleFavorite(item.id)}
										aria-label={item.isFavorite ? 'Unfavorite' : 'Favorite'}
									>
										<i class="bi {item.isFavorite ? 'bi-star-fill' : 'bi-star'}"></i>
									</button>
									<button
										class="btn btn-sm btn-primary"
										onclick={() => {
											Logger.info('Restoring query from history', { id: item.id });
											onRestore(item);
										}}
									>
										Restore
									</button>
									<button
										class="btn btn-sm btn-ghost text-error"
										aria-label="Delete"
										onclick={() => {
											Logger.info('Deleting query from history', { id: item.id });
											removeFromHistory(item.id);
										}}
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
