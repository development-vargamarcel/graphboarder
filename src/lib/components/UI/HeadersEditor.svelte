<script lang="ts">
	import { onMount } from 'svelte';
	import { Logger } from '$lib/utils/logger';

	interface Props {
		endpointInfo?: any;
		onClose: () => void;
	}

	let { endpointInfo = null, onClose }: Props = $props();

	let headers = $state<{ key: string; value: string }[]>([]);
	let keyInput = $state('');
	let valueInput = $state('');

	const storageKey = $derived(endpointInfo?.id ? `headers_${endpointInfo.id}` : 'headers');

	onMount(() => {
		const stored = localStorage.getItem(storageKey);
		if (stored) {
			try {
				const obj = JSON.parse(stored);
				headers = Object.entries(obj).map(([k, v]) => ({ key: k, value: String(v) }));
			} catch (e) {
				Logger.error('Failed to parse headers from localStorage', e);
			}
		}
	});

	function addHeader() {
		if (keyInput && valueInput) {
			headers = [...headers, { key: keyInput, value: valueInput }];
			keyInput = '';
			valueInput = '';
		}
	}

	function removeHeader(index: number) {
		headers = headers.filter((_, i) => i !== index);
	}

	function save() {
		const obj = headers.reduce((acc, curr) => {
			acc[curr.key] = curr.value;
			return acc;
		}, {} as Record<string, string>);
		localStorage.setItem(storageKey, JSON.stringify(obj));
		Logger.info('Headers saved', { storageKey, headers: obj });
		onClose();
	}
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
	<div class="w-11/12 max-w-2xl bg-base-100 p-6 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
		<h3 class="font-bold text-lg mb-4">Edit Headers {endpointInfo?.id ? `for ${endpointInfo.id}` : '(Global)'}</h3>

		<div class="overflow-y-auto max-h-[60vh] mb-4">
			<table class="table w-full">
				<thead>
					<tr>
						<th>Key</th>
						<th>Value</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{#each headers as header, i}
						<tr>
							<td>
                                <input type="text" bind:value={header.key} class="input input-bordered w-full input-sm" />
                            </td>
							<td>
                                <input type="text" bind:value={header.value} class="input input-bordered w-full input-sm" />
                            </td>
							<td>
								<button class="btn btn-square btn-sm btn-error" aria-label="Delete header" onclick={() => removeHeader(i)}>
									<i class="bi bi-trash"></i>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
            {#if headers.length === 0}
                <div class="text-center text-gray-500 py-4">No custom headers set.</div>
            {/if}
		</div>

		<div class="flex gap-2 mb-6 p-4 bg-base-200 rounded">
			<input type="text" placeholder="New Key" class="input input-bordered w-full" bind:value={keyInput} />
			<input type="text" placeholder="New Value" class="input input-bordered w-full" bind:value={valueInput} />
			<button class="btn btn-primary" onclick={addHeader} disabled={!keyInput || !valueInput}>Add</button>
		</div>

		<div class="modal-action">
            <button class="btn" onclick={onClose}>Cancel</button>
			<button class="btn btn-success" onclick={save}>Save</button>
		</div>
	</div>
</div>
