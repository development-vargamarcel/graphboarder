<!--
	@component
	The EndpointManager component allows users to view, add, delete, and switch between GraphQL endpoints.
	It manages a list of custom endpoints persisted in localStorage and combines them with built-in test endpoints.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { localEndpoints } from '$lib/stores/testData/testEndpoints';
	import { Logger } from '$lib/utils/logger';
	import { toast } from '$lib/stores/toastStore';

	interface Props {
		/**
		 * Callback function to close the modal.
		 */
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	// Access localStorageEndpoints context
	// Note: We cast to any because the context type isn't exported globally yet, but it's a writable store (persisted)
	let localStorageEndpoints = getContext<any>('localStorageEndpoints');

	let activeTab = $state<'list' | 'add'>('list');
	let newName = $state('');
	let newUrl = $state('');
	let newHeaders = $state('');

	// Combine endpoints
	let customEndpoints = $derived($localStorageEndpoints || []);
	let allEndpoints = $derived([...customEndpoints, ...localEndpoints]);

	function handleEndpointClick(endpoint: any) {
		const prefix = endpoint.id.startsWith('localEndpoint--') || endpoint.id.startsWith('localstorageEndpoint--')
			? '' // already has prefix
			: (customEndpoints.find((e: any) => e.id === endpoint.id) ? 'localstorageEndpoint--' : 'localEndpoint--');

        // If the ID already has the prefix, don't add it again.
        // localEndpoints in testEndpoints.ts have simple IDs like 'nhost'.
        // The routing expects 'localEndpoint--nhost'.

        let targetId = endpoint.id;
        if (!targetId.includes('--')) {
             if (customEndpoints.find((e: any) => e.id === endpoint.id)) {
                 targetId = `localstorageEndpoint--${endpoint.id}`;
             } else {
                 targetId = `localEndpoint--${endpoint.id}`;
             }
        }

		Logger.info('Switching to endpoint', { targetId });
		goto(`/endpoints/${targetId}`).then(() => {
			onClose();
		});
	}

	function addEndpoint() {
		if (!newName || !newUrl) return;

		const id = crypto.randomUUID();
		const headersObj: Record<string, string> = {};

		if (newHeaders) {
			try {
				newHeaders.split('\n').forEach(line => {
					const [key, value] = line.split(':');
					if (key && value) {
						headersObj[key.trim()] = value.trim();
					}
				});
			} catch (e) {
				Logger.error('Failed to parse headers', e);
				toast.error('Invalid headers format. Use Key:Value (one per line)');
				return;
			}
		}

		const newEndpoint = {
			id,
			url: newUrl,
			description: newName, // Using description as display name
			headers: headersObj,
            isMantained: true // Assume user maintained
		};

		localStorageEndpoints.update((current: any[]) => [...current, newEndpoint]);

        // Reset form
		newName = '';
		newUrl = '';
		newHeaders = '';
		activeTab = 'list';
	}

	function deleteEndpoint(id: string) {
		if (confirm('Are you sure you want to delete this endpoint?')) {
			localStorageEndpoints.update((current: any[]) => current.filter((e: any) => e.id !== id));
		}
	}
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
	<div class="w-11/12 max-w-2xl bg-base-100 p-6 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
		<div class="flex justify-between items-center mb-4">
			<h3 class="font-bold text-lg">Endpoint Manager</h3>
			<button class="btn btn-sm btn-ghost" onclick={onClose}>✕</button>
		</div>

		<div class="tabs tabs-boxed mb-4">
			<button
                class="tab {activeTab === 'list' ? 'tab-active' : ''}"
                onclick={() => activeTab = 'list'}
            >List</button>
			<button
                class="tab {activeTab === 'add' ? 'tab-active' : ''}"
                onclick={() => activeTab = 'add'}
            >Add New</button>
		</div>

		{#if activeTab === 'list'}
			<div class="overflow-y-auto max-h-[60vh] space-y-2 p-1">
                {#if allEndpoints.length === 0}
                    <div class="text-center text-gray-500 py-4">No endpoints found.</div>
                {/if}
				{#each allEndpoints as endpoint}
					<div class="flex items-center justify-between bg-base-200 p-3 rounded hover:bg-base-300 transition-colors">
						<button
                            class="flex-1 text-left"
                            onclick={() => handleEndpointClick(endpoint)}
                        >
							<div class="font-bold">{endpoint.description || endpoint.id}</div>
							<div class="text-xs text-gray-500 truncate max-w-md">{endpoint.url}</div>
						</button>
                        {#if customEndpoints.find((e: any) => e.id === endpoint.id)}
                             <button
                                class="btn btn-ghost btn-xs text-error ml-2"
                                onclick={() => deleteEndpoint(endpoint.id)}
                                title="Delete"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        {/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="space-y-4">
				<div class="form-control">
					<label class="label" for="endpoint-name">
						<span class="label-text">Name (Description)</span>
					</label>
					<input id="endpoint-name" type="text" bind:value={newName} class="input input-bordered w-full" placeholder="My API" />
				</div>

				<div class="form-control">
					<label class="label" for="endpoint-url">
						<span class="label-text">GraphQL URL</span>
					</label>
					<input id="endpoint-url" type="text" bind:value={newUrl} class="input input-bordered w-full" placeholder="https://api.example.com/graphql" />
				</div>

				<div class="form-control">
					<label class="label" for="endpoint-headers">
						<span class="label-text">Headers (Key:Value, one per line)</span>
					</label>
					<textarea id="endpoint-headers" bind:value={newHeaders} class="textarea textarea-bordered h-24" placeholder="Authorization: Bearer token"></textarea>
				</div>

				<div class="flex justify-end gap-2 mt-4">
					<button class="btn" onclick={() => activeTab = 'list'}>Cancel</button>
					<button class="btn btn-primary" onclick={addEndpoint} disabled={!newName || !newUrl}>Add Endpoint</button>
				</div>
			</div>
		{/if}
	</div>
</div>
