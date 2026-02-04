<script lang="ts">
	import {
		environmentStore,
		activeEnvironmentIdStore,
		createEnvironment,
		deleteEnvironment,
		updateEnvironment,
		setActiveEnvironment,
		type Environment
	} from '$lib/stores/environmentStore';
	import { Logger } from '$lib/utils/logger';
	import { toast } from '$lib/stores/toastStore';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let selectedEnvId = $state<string>($activeEnvironmentIdStore);
	let newEnvName = $state('');
	let keyInput = $state('');
	let valueInput = $state('');

	// Get selected environment object
	let selectedEnv = $derived(
		$environmentStore.find((e) => e.id === selectedEnvId) || $environmentStore[0]
	);

	// Transform variables object to array for editing
	let variablesList = $derived(
		Object.entries(selectedEnv.variables).map(([key, value]) => ({ key, value }))
	);

	function handleAddEnvironment() {
		if (newEnvName.trim()) {
			const id = createEnvironment(newEnvName.trim());
			selectedEnvId = id;
			newEnvName = '';
			toast.success('Environment created');
		}
	}

	function handleDeleteEnvironment(id: string) {
		if (confirm('Are you sure you want to delete this environment?')) {
			if (selectedEnvId === id) {
				selectedEnvId = 'global';
			}
			deleteEnvironment(id);
			toast.info('Environment deleted');
		}
	}

	function handleAddVariable() {
		if (keyInput && valueInput) {
			const newVariables = { ...selectedEnv.variables, [keyInput]: valueInput };
			updateEnvironment(selectedEnvId, { variables: newVariables });
			keyInput = '';
			valueInput = '';
			// toast.success('Variable added');
		}
	}

	function handleRemoveVariable(key: string) {
		const newVariables = { ...selectedEnv.variables };
		delete newVariables[key];
		updateEnvironment(selectedEnvId, { variables: newVariables });
	}

	function handleUpdateVariable(oldKey: string, newKey: string, newValue: string) {
		if (oldKey !== newKey) {
			// Key changed: remove old, add new
			const newVariables = { ...selectedEnv.variables };
			delete newVariables[oldKey];
			newVariables[newKey] = newValue;
			updateEnvironment(selectedEnvId, { variables: newVariables });
		} else {
			// Value changed
			const newVariables = { ...selectedEnv.variables, [newKey]: newValue };
			updateEnvironment(selectedEnvId, { variables: newVariables });
		}
	}

	function handleRenameEnvironment(name: string) {
		updateEnvironment(selectedEnvId, { name });
	}
</script>

<div
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
	role="dialog"
	aria-modal="true"
>
	<div
		class="w-11/12 max-w-4xl bg-base-100 rounded-lg shadow-xl overflow-hidden flex flex-col h-[80vh]"
	>
		<!-- Header -->
		<div class="p-4 border-b border-base-200 flex justify-between items-center bg-base-200">
			<h3 class="font-bold text-lg"><i class="bi bi-layers"></i> Environment Manager</h3>
			<button class="btn btn-sm btn-ghost" onclick={onClose}>✕</button>
		</div>

		<!-- Body -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Sidebar: Environment List -->
			<div class="w-1/3 border-r border-base-200 flex flex-col bg-base-100">
				<div class="p-2 border-b border-base-200">
					<div class="join w-full">
						<input
							class="input input-sm input-bordered join-item w-full"
							placeholder="New Environment Name"
							bind:value={newEnvName}
							onkeydown={(e) => e.key === 'Enter' && handleAddEnvironment()}
						/>
						<button
							class="btn btn-sm btn-primary join-item"
							onclick={handleAddEnvironment}
							disabled={!newEnvName.trim()}
						>
							<i class="bi bi-plus"></i>
						</button>
					</div>
				</div>
				<div class="overflow-y-auto flex-1 p-2 space-y-1">
					{#each $environmentStore as env}
						<div
							class="flex items-center justify-between p-2 rounded cursor-pointer group {selectedEnvId ===
							env.id
								? 'bg-primary/10 border border-primary/20'
								: 'hover:bg-base-200'}"
							onclick={() => (selectedEnvId = env.id)}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && (selectedEnvId = env.id)}
						>
							<div class="flex items-center gap-2 truncate">
								{#if $activeEnvironmentIdStore === env.id}
									<i class="bi bi-check-circle-fill text-success" title="Active Environment"></i>
								{:else}
									<i
										class="bi bi-circle text-gray-300 hover:text-success cursor-pointer"
										title="Set as Active"
										onclick={(e) => {
											e.stopPropagation();
											setActiveEnvironment(env.id);
											toast.success(`Active environment set to ${env.name}`);
										}}
										role="button"
										tabindex="0"
										onkeydown={(e) => {
											if (e.key === 'Enter') {
												e.stopPropagation();
												setActiveEnvironment(env.id);
											}
										}}
									></i>
								{/if}
								<span class="font-medium">{env.name}</span>
							</div>
							{#if env.id !== 'global'}
								<button
									class="btn btn-xs btn-ghost text-error opacity-0 group-hover:opacity-100 transition-opacity"
									onclick={(e) => {
										e.stopPropagation();
										handleDeleteEnvironment(env.id);
									}}
								>
									<i class="bi bi-trash"></i>
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Main: Variable Editor -->
			<div class="w-2/3 flex flex-col bg-base-100">
				{#if selectedEnv}
					<div class="p-4 border-b border-base-200 flex justify-between items-center">
						<div class="flex items-center gap-2">
							{#if selectedEnv.id === 'global'}
								<h2 class="text-xl font-bold">{selectedEnv.name}</h2>
								<div class="badge badge-outline">Read-only Name</div>
							{:else}
								<input
									type="text"
									class="input input-sm input-ghost text-xl font-bold w-full"
									value={selectedEnv.name}
									onchange={(e) => handleRenameEnvironment(e.currentTarget.value)}
								/>
							{/if}
						</div>
						<div class="text-xs text-gray-500">
							ID: {selectedEnv.id}
						</div>
					</div>

					<div class="flex-1 overflow-y-auto p-4">
						<table class="table table-sm w-full">
							<thead>
								<tr>
									<th>Variable</th>
									<th>Value</th>
									<th class="w-10"></th>
								</tr>
							</thead>
							<tbody>
								{#each variablesList as { key, value }}
									<tr>
										<td>
											<input
												type="text"
												class="input input-xs input-bordered w-full font-mono"
												value={key}
												onchange={(e) => handleUpdateVariable(key, e.currentTarget.value, value)}
											/>
										</td>
										<td>
											<input
												type="text"
												class="input input-xs input-bordered w-full"
												value={value}
												onchange={(e) => handleUpdateVariable(key, key, e.currentTarget.value)}
											/>
										</td>
										<td>
											<button
												class="btn btn-xs btn-square btn-ghost text-error"
												onclick={() => handleRemoveVariable(key)}
											>
												<i class="bi bi-trash"></i>
											</button>
										</td>
									</tr>
								{/each}
								{#if variablesList.length === 0}
									<tr>
										<td colspan="3" class="text-center text-gray-400 py-8">
											No variables defined in this environment.
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>

					<div class="p-4 border-t border-base-200 bg-base-50">
						<div class="flex gap-2">
							<input
								type="text"
								placeholder="Variable Name"
								class="input input-sm input-bordered flex-1 font-mono"
								bind:value={keyInput}
								onkeydown={(e) => e.key === 'Enter' && handleAddVariable()}
							/>
							<input
								type="text"
								placeholder="Value"
								class="input input-sm input-bordered flex-1"
								bind:value={valueInput}
								onkeydown={(e) => e.key === 'Enter' && handleAddVariable()}
							/>
							<button
								class="btn btn-sm btn-primary"
								onclick={handleAddVariable}
								disabled={!keyInput}
							>
								Add
							</button>
						</div>
						<p class="text-xs text-gray-500 mt-2">
							Use variables in headers or queries like <code>{`{{variableName}}`}</code>.
						</p>
					</div>
				{:else}
					<div class="flex items-center justify-center h-full text-gray-400">
						Select an environment to edit
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
