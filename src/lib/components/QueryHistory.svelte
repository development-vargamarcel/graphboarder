<script lang="ts">
	import {
		queryHistory,
		queryCollections,
		removeFromHistory,
		clearHistory,
		toggleFavorite,
		updateHistoryItem,
		exportHistory,
		importHistory,
		createCollection,
		deleteCollection,
		renameCollection,
		moveItemToCollection
	} from '$lib/stores/queryHistory';
	import type { HistoryItem, QueryCollection } from '$lib/stores/queryHistory';
	import { Logger } from '$lib/utils/logger';
	import { toast } from '$lib/stores/toastStore';

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
	let searchTerm = $state('');
	let selectedCollectionId = $state<string | 'all' | 'favorites'>('all');
	let isCreatingCollection = $state(false);
	let newCollectionName = $state('');
	let editingCollectionId = $state<string | null>(null);
	let editingCollectionName = $state('');

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
		a.download = `auto-gql-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
					const outcome = importHistory(result);
					if (outcome.success) {
						toast.success(outcome.message);
					} else {
						toast.error(outcome.message);
					}
				}
			};
			reader.readAsText(file);
		}
		target.value = ''; // Reset
	};

	const handleCreateCollection = () => {
		if (newCollectionName.trim()) {
			Logger.info('User created collection', { name: newCollectionName });
			createCollection(newCollectionName.trim());
			newCollectionName = '';
			isCreatingCollection = false;
			toast.success('Collection created');
		}
	};

	const handleRenameCollection = (id: string) => {
		if (editingCollectionName.trim()) {
			Logger.info('User renamed collection', { id, newName: editingCollectionName });
			renameCollection(id, editingCollectionName.trim());
			editingCollectionId = null;
			toast.success('Collection renamed');
		}
	};

	// Sort: Favorites first, then by timestamp descending
	let sortedHistory = $derived(
		[...$queryHistory]
			.filter((item) => {
				// Search term filter
				if (searchTerm) {
					const term = searchTerm.toLowerCase();
					const matchesSearch =
						(item.name && item.name.toLowerCase().includes(term)) ||
						(item.operationName && item.operationName.toLowerCase().includes(term)) ||
						(item.query && item.query.toLowerCase().includes(term)) ||
						(item.endpointId && item.endpointId.toLowerCase().includes(term));
					if (!matchesSearch) return false;
				}

				// Collection filter
				if (selectedCollectionId === 'all') return true;
				if (selectedCollectionId === 'favorites') return item.isFavorite;
				return item.collectionId === selectedCollectionId;
			})
			.sort((a, b) => {
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

	const moveItem = (item: HistoryItem, targetCollectionId: string | null) => {
		Logger.info('User moved query to collection', { itemId: item.id, targetCollectionId });
		moveItemToCollection(item.id, targetCollectionId);
		toast.success(targetCollectionId ? 'Moved to collection' : 'Removed from collection');
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
		class="bg-base-100 w-full max-w-5xl h-[85vh] rounded-box flex flex-col shadow-xl overflow-hidden"
		role="button"
		tabindex="0"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Header -->
		<div class="p-4 border-b border-base-300 flex justify-between items-center bg-base-200">
			<h3 class="text-xl font-bold">Query History</h3>
			<div class="flex space-x-2 items-center">
				<div class="join">
					<input
						type="text"
						class="input input-sm input-bordered join-item"
						placeholder="Search history..."
						bind:value={searchTerm}
					/>
				</div>
				<input
					type="file"
					accept=".json"
					class="hidden"
					bind:this={fileInput}
					onchange={handleImport}
				/>
				<div class="dropdown dropdown-end">
					<div tabindex="0" role="button" class="btn btn-sm btn-ghost">
						<i class="bi bi-three-dots-vertical"></i> Actions
					</div>
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<ul
						tabindex="0"
						class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
					>
						<li>
							<button onclick={() => fileInput.click()}>
								<i class="bi bi-upload"></i> Import
							</button>
						</li>
						<li>
							<button onclick={handleExport}>
								<i class="bi bi-download"></i> Export
							</button>
						</li>
						{#if $queryHistory.length > 0}
							<li>
								<button
									class="text-error"
									onclick={() => {
										if (confirm('Are you sure you want to clear all history?')) {
											clearHistory();
											toast.success('History cleared');
										}
									}}
								>
									<i class="bi bi-trash"></i> Clear All History
								</button>
							</li>
						{/if}
					</ul>
				</div>
				<button class="btn btn-sm btn-ghost" onclick={onClose}>✕</button>
			</div>
		</div>

		<!-- Main Content Split -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Sidebar -->
			<div class="w-64 border-r border-base-300 flex flex-col bg-base-200">
				<div class="p-2 border-b border-base-300 flex justify-between items-center">
					<span class="font-bold text-sm text-base-content/70">COLLECTIONS</span>
					<button
						class="btn btn-xs btn-ghost btn-square"
						onclick={() => (isCreatingCollection = true)}
						title="New Collection"
					>
						<i class="bi bi-plus-lg"></i>
					</button>
				</div>

				{#if isCreatingCollection}
					<div class="p-2 bg-base-100 border-b border-base-300">
						<input
							class="input input-xs input-bordered w-full mb-1"
							bind:value={newCollectionName}
							placeholder="Collection Name"
							use:focus
							onkeydown={(e) => {
								if (e.key === 'Enter') handleCreateCollection();
								if (e.key === 'Escape') isCreatingCollection = false;
							}}
						/>
						<div class="flex justify-end gap-1">
							<button class="btn btn-xs btn-ghost" onclick={() => (isCreatingCollection = false)}>Cancel</button>
							<button class="btn btn-xs btn-primary" onclick={handleCreateCollection}>Create</button>
						</div>
					</div>
				{/if}

				<ul class="menu w-full p-2 gap-1 overflow-y-auto flex-1">
					<li>
						<button
							class={selectedCollectionId === 'all' ? 'active' : ''}
							onclick={() => (selectedCollectionId = 'all')}
						>
							<i class="bi bi-clock-history"></i> All Queries
						</button>
					</li>
					<li>
						<button
							class={selectedCollectionId === 'favorites' ? 'active' : ''}
							onclick={() => (selectedCollectionId = 'favorites')}
						>
							<i class="bi bi-star"></i> Favorites
						</button>
					</li>
					<li class="menu-title mt-2">USER COLLECTIONS</li>
					{#each $queryCollections as collection (collection.id)}
						<li class="group/coll relative">
							{#if editingCollectionId === collection.id}
								<div class="flex items-center p-1 bg-base-100 rounded">
									<input
										class="input input-xs input-bordered w-full"
										bind:value={editingCollectionName}
										onkeydown={(e) => {
											if (e.key === 'Enter') handleRenameCollection(collection.id);
											if (e.key === 'Escape') editingCollectionId = null;
										}}
										use:focus
										onblur={() => handleRenameCollection(collection.id)}
									/>
								</div>
							{:else}
								<button
									class="flex justify-between items-center pr-8 {selectedCollectionId === collection.id
										? 'active'
										: ''}"
									onclick={() => (selectedCollectionId = collection.id)}
								>
									<span class="truncate">{collection.name}</span>
								</button>
								<div class="absolute right-1 top-1 hidden group-hover/coll:flex bg-base-200 rounded">
									<button
										class="btn btn-xs btn-ghost btn-square"
										aria-label="Rename Collection"
										title="Rename Collection"
										onclick={(e) => {
											e.stopPropagation();
											editingCollectionId = collection.id;
											editingCollectionName = collection.name;
										}}
									>
										<i class="bi bi-pencil"></i>
									</button>
									<button
										class="btn btn-xs btn-ghost btn-square text-error"
										aria-label="Delete Collection"
										title="Delete Collection"
										onclick={(e) => {
											e.stopPropagation();
											if (confirm(`Delete collection "${collection.name}"?`)) {
												deleteCollection(collection.id);
												if (selectedCollectionId === collection.id) {
													selectedCollectionId = 'all';
												}
												toast.success('Collection deleted');
											}
										}}
									>
										<i class="bi bi-trash"></i>
									</button>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			<!-- Main List -->
			<div class="flex-1 overflow-y-auto p-4 bg-base-100">
				{#if sortedHistory.length === 0}
					<div class="flex flex-col items-center justify-center h-full text-base-content/50">
						<i class="bi bi-inbox text-4xl mb-2"></i>
						<p>No queries found.</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each sortedHistory as item (item.id)}
							<div
								class="card bg-base-200 shadow-sm hover:shadow-md transition-shadow border-l-4 {item.isFavorite
									? 'border-primary'
									: 'border-transparent'}"
							>
								<div class="card-body p-3">
									<div class="flex justify-between items-start mb-2">
										<!-- Title and Meta -->
										<div class="flex-1 mr-4 min-w-0">
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
														class="font-bold cursor-pointer hover:underline text-left truncate block max-w-full"
														onclick={() => startEditing(item)}
													>
														{item.name || item.operationName || 'Untitled Query'}
														{#if !item.name && !item.operationName}
															<span class="text-xs italic text-base-content/50">(No name)</span>
														{/if}
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

											<div class="text-xs text-base-content/70 mt-1 flex flex-wrap items-center gap-2">
												<span>{formatDate(item.timestamp)}</span>
												{#if item.endpointId}
													<span class="badge badge-xs badge-outline">{item.endpointId}</span>
												{/if}
												{#if item.collectionId}
													{@const col = $queryCollections.find(c => c.id === item.collectionId)}
													{#if col}
														<span class="badge badge-xs badge-secondary badge-outline" title="Collection">
															<i class="bi bi-folder mr-1"></i> {col.name}
														</span>
													{/if}
												{/if}
											</div>
										</div>

										<!-- Actions -->
										<div class="flex items-center space-x-1">
											<div class="dropdown dropdown-end">
												<div tabindex="0" role="button" class="btn btn-sm btn-ghost" title="Move to Collection">
													<i class="bi bi-folder-symlink"></i>
												</div>
												<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
												<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
													<li class="menu-title">Move to...</li>
													<li>
														<button onclick={() => moveItem(item, null)} class={!item.collectionId ? 'active' : ''}>
															(None)
														</button>
													</li>
													{#each $queryCollections as col}
														<li>
															<button onclick={() => moveItem(item, col.id)} class={item.collectionId === col.id ? 'active' : ''}>
																{col.name}
															</button>
														</li>
													{/each}
												</ul>
											</div>

											<button
												class="btn btn-sm btn-ghost {item.isFavorite
													? 'text-warning'
													: 'text-base-content/30'}"
												onclick={() => toggleFavorite(item.id)}
												title="Toggle Favorite"
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
												onclick={() => {
													if(confirm('Delete this query from history?')) {
														removeFromHistory(item.id);
													}
												}}
												title="Delete"
											>
												<i class="bi bi-trash"></i>
											</button>
										</div>
									</div>

									<!-- Query Preview -->
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
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
