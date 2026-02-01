<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import type {
		QMSMainWraperContext,
		RootType,
		FieldWithDerivedData,
		SchemaDataStore,
		GraphQLKind
	} from '$lib/types';
	import { Logger } from '$lib/utils/logger';
	import { get } from 'svelte/store';
	import { toast } from '$lib/stores/toastStore';

	interface Props {
		prefix?: string;
	}

	let { prefix = '' }: Props = $props();

	let context = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	let schemaDataStore = context?.schemaData;

	let searchQuery = $state('');
	let selectedType = $state<RootType | null>(null);

	// Using a derived value to get the current schema data
	let schemaData = $derived(schemaDataStore ? $schemaDataStore : null);

	let rootTypes = $derived(schemaData?.rootTypes || []);

	let filteredTypes = $derived.by(() => {
		if (!searchQuery.trim()) {
			return rootTypes;
		}
		const query = searchQuery.toLowerCase();
		return rootTypes.filter((type) => type.name.toLowerCase().includes(query));
	});

	$effect(() => {
		Logger.debug('SchemaVisualizer mounted', { rootTypesCount: rootTypes.length });
	});

	const selectType = (type: RootType) => {
		selectedType = type;
		Logger.debug('Selected type', { typeName: type.name });
	};

	const copySchema = () => {
		if (schemaData?.schema) {
			navigator.clipboard.writeText(JSON.stringify(schemaData.schema, null, 2));
			toast.success('Schema introspection result copied to clipboard!');
		} else {
			toast.error('Schema data not available.');
		}
	};

	const getKindColor = (kind: GraphQLKind) => {
		switch (kind) {
			case 'OBJECT':
				return 'badge-primary';
			case 'SCALAR':
				return 'badge-secondary';
			case 'INTERFACE':
				return 'badge-accent';
			case 'ENUM':
				return 'badge-info';
			case 'INPUT_OBJECT':
				return 'badge-warning';
			case 'UNION':
				return 'badge-error';
			default:
				return 'badge-ghost';
		}
	};
</script>

<div class="flex h-full w-full bg-base-100 overflow-hidden">
	<!-- Sidebar / List -->
	<div class="w-1/3 border-r border-base-300 flex flex-col h-full">
		<div class="p-4 bg-base-200">
			<h2 class="text-xl font-bold mb-2">Schema Types</h2>
			<input
				type="text"
				placeholder="Search types..."
				class="input input-bordered w-full input-sm"
				bind:value={searchQuery}
			/>
			<div class="text-xs text-gray-500 mt-1">
				{filteredTypes.length} types found
			</div>
		</div>
		<div class="overflow-y-auto flex-1 p-2">
			{#each filteredTypes as type}
				<button
					class="w-full text-left p-2 hover:bg-base-200 rounded flex justify-between items-center {selectedType?.name ===
					type.name
						? 'bg-primary text-primary-content hover:bg-primary-focus'
						: ''}"
					onclick={() => selectType(type)}
				>
					<span class="truncate font-mono text-sm" title={type.name}>{type.name}</span>
					<span class="badge badge-xs {getKindColor(type.kind)}">{type.kind}</span>
				</button>
			{/each}
		</div>
		<div class="p-2 border-t border-base-300">
			<button class="btn btn-sm btn-outline w-full" onclick={copySchema}>
				<i class="bi bi-clipboard"></i> Copy Introspection
			</button>
		</div>
	</div>

	<!-- Details View -->
	<div class="flex-1 overflow-y-auto p-6 bg-base-100 h-full">
		{#if selectedType}
			<div class="prose max-w-none">
				<div class="flex items-center gap-2 mb-4">
					<h1 class="m-0">{selectedType.name}</h1>
					<span class="badge {getKindColor(selectedType.kind)} text-lg p-3"
						>{selectedType.kind}</span
					>
				</div>

				{#if selectedType.description}
					<div class="alert alert-info shadow-sm mb-4">
						<div>
							<i class="bi bi-info-circle"></i>
							<span>{selectedType.description}</span>
						</div>
					</div>
				{/if}

				{#if selectedType.fields && selectedType.fields.length > 0}
					<h3>Fields</h3>
					<div class="overflow-x-auto">
						<table class="table table-zebra w-full text-sm">
							<thead>
								<tr>
									<th>Name</th>
									<th>Type</th>
									<th>Description</th>
								</tr>
							</thead>
							<tbody>
								{#each selectedType.fields as field}
									<tr>
										<td class="font-bold font-mono">{field.name}</td>
										<td class="font-mono text-primary">
											{field.dd_displayName || 'Unknown'}
											{#if field.args && field.args.length > 0}
												<div class="text-xs text-gray-500 mt-1">
													Arguments:
													{#each field.args as arg}
														<span class="badge badge-ghost badge-sm mr-1"
															>{arg.name}: {arg.dd_displayName}</span
														>
													{/each}
												</div>
											{/if}
										</td>
										<td class="text-gray-600">{field.description || '-'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

				{#if selectedType.inputFields && selectedType.inputFields.length > 0}
					<h3>Input Fields</h3>
					<div class="overflow-x-auto">
						<table class="table table-zebra w-full text-sm">
							<thead>
								<tr>
									<th>Name</th>
									<th>Type</th>
									<th>Description</th>
								</tr>
							</thead>
							<tbody>
								{#each selectedType.inputFields as field}
									<tr>
										<td class="font-bold font-mono">{field.name}</td>
										<td class="font-mono text-secondary">{field.dd_displayName || 'Unknown'}</td>
										<td class="text-gray-600">{field.description || '-'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

				{#if selectedType.enumValues && selectedType.enumValues.length > 0}
					<h3>Enum Values</h3>
					<div class="flex flex-wrap gap-2">
						{#each selectedType.enumValues as enumVal}
							<div class="tooltip" data-tip={enumVal.description || 'No description'}>
								<div class="badge badge-outline p-3 font-mono">{enumVal.name}</div>
							</div>
						{/each}
					</div>
				{/if}

				{#if selectedType.interfaces && selectedType.interfaces.length > 0}
					<h3>Interfaces</h3>
					<div class="flex gap-2">
						{#each selectedType.interfaces as iface}
							<button
								class="btn btn-xs btn-outline"
								onclick={() => {
									const found = rootTypes.find((t) => t.name === iface.name);
									if (found) selectType(found);
								}}
							>
								{iface.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex items-center justify-center h-full text-gray-400">
				<div class="text-center">
					<i class="bi bi-diagram-3 text-6xl mb-4 block"></i>
					<p class="text-xl">Select a type to view details</p>
				</div>
			</div>
		{/if}
	</div>
</div>
