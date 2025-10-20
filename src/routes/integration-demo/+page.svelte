<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import InputShadcn from "$lib/components/fields/InputShadcn.svelte";
	import ToggleShadcn from "$lib/components/fields/ToggleShadcn.svelte";
	import ModalShadcn from "$lib/components/ModalShadcn.svelte";

	// Mock context for mutationVersion (used by InputShadcn)
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const mutationVersion = writable(false);
	setContext('mutationVersion', mutationVersion);

	// Simulate GraphQL field configuration
	let fields = $state([
		{
			name: 'id',
			type: 'text',
			value: '',
			enabled: true,
			required: true,
			description: 'Unique identifier'
		},
		{
			name: 'name',
			type: 'text',
			value: 'John Doe',
			enabled: true,
			required: true,
			description: 'User full name'
		},
		{
			name: 'email',
			type: 'text',
			value: 'john@example.com',
			enabled: true,
			required: true,
			description: 'Email address'
		},
		{
			name: 'age',
			type: 'number',
			value: 25,
			enabled: false,
			required: false,
			description: 'User age'
		},
		{
			name: 'premium',
			type: 'checkbox',
			value: true,
			enabled: true,
			required: false,
			description: 'Premium account status'
		},
		{
			name: 'active',
			type: 'checkbox',
			value: false,
			enabled: true,
			required: false,
			description: 'Account active status'
		}
	]);

	// Filter configuration
	let filters = $state([
		{
			field: 'status',
			operator: '_eq',
			value: 'active',
			enabled: true
		},
		{
			field: 'role',
			operator: '_in',
			value: '["admin","user"]',
			enabled: false
		},
		{
			field: 'createdAt',
			operator: '_gte',
			value: '2024-01-01',
			enabled: true
		}
	]);

	// Modal states
	let showFieldModal = $state(false);
	let showFilterModal = $state(false);
	let showResultsModal = $state(false);

	// Generated query
	let generatedQuery = $derived(() => {
		const enabledFields = fields.filter(f => f.enabled);
		const fieldNames = enabledFields.map(f => f.name).join('\n    ');

		const activeFilters = filters.filter(f => f.enabled);
		const whereClause = activeFilters.length > 0
			? `(where: {\n      ${activeFilters.map(f => `${f.field}: { ${f.operator}: ${f.value} }`).join('\n      ')}\n    })`
			: '';

		return `query GetUsers {
  users${whereClause} {
    ${fieldNames}
  }
}`;
	});

	// Form data for demonstration
	let formData = $state({
		endpoint: 'https://api.example.com/graphql',
		timeout: 30,
		retries: 3,
		cacheEnabled: true,
		debugMode: false
	});

	// Handle field changes
	const handleFieldChange = (index: number, detail: any) => {
		console.log(`Field ${fields[index].name} changed:`, detail);
		fields[index].value = detail.chd_rawValue;
	};

	const handleToggleChange = (index: number, detail: any) => {
		console.log(`Toggle ${fields[index].name} changed:`, detail);
		fields[index].enabled = detail.chd_rawValue;
	};

	// Execute query simulation
	let queryResult = $state<any>(null);
	let isExecuting = $state(false);

	const executeQuery = async () => {
		isExecuting = true;
		await new Promise(resolve => setTimeout(resolve, 1500));

		queryResult = {
			data: {
				users: fields.filter(f => f.enabled && f.value).map((field, idx) => ({
					[field.name]: field.value
				})).reduce((acc, curr) => ({ ...acc, ...curr }), { _queryTime: '145ms' })
			}
		};

		isExecuting = false;
		showResultsModal = true;
	};
</script>

<div class="container mx-auto p-6 space-y-6">
	<!-- Header -->
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">shadcn-svelte Integration Demo</h1>
		<p class="text-muted-foreground">
			Real integration of shadcn-svelte components with GraphQL Explorer patterns
		</p>
		<div class="flex gap-2">
			<Badge variant="default">InputShadcn</Badge>
			<Badge variant="secondary">ToggleShadcn</Badge>
			<Badge variant="outline">ModalShadcn</Badge>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Left Panel: Configuration -->
		<div class="space-y-6">
			<!-- Endpoint Configuration -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Endpoint Configuration</Card.Title>
					<Card.Description>Configure GraphQL endpoint settings</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">GraphQL Endpoint URL</label>
						<InputShadcn
							displayInterface="text"
							bind:rawValue={formData.endpoint}
							onChanged={(detail) => console.log('Endpoint changed:', detail)}
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<label class="text-sm font-medium">Timeout (seconds)</label>
							<InputShadcn
								displayInterface="number"
								bind:rawValue={formData.timeout}
								onChanged={(detail) => console.log('Timeout changed:', detail)}
							/>
						</div>

						<div class="space-y-2">
							<label class="text-sm font-medium">Max Retries</label>
							<InputShadcn
								displayInterface="number"
								bind:rawValue={formData.retries}
								onChanged={(detail) => console.log('Retries changed:', detail)}
							/>
						</div>
					</div>

					<div class="space-y-3 pt-2">
						<ToggleShadcn
							bind:rawValue={formData.cacheEnabled}
							showValue={false}
							useSwap={true}
							swapOnText="Cache Enabled"
							swapOffText="Cache Disabled"
							onChanged={(detail) => console.log('Cache toggle:', detail)}
						/>

						<ToggleShadcn
							bind:rawValue={formData.debugMode}
							showValue={true}
							onChanged={(detail) => console.log('Debug mode:', detail)}
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Field Selection -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<div>
						<Card.Title>Field Selection</Card.Title>
						<Card.Description>Select and configure query fields</Card.Description>
					</div>
					<Button size="sm" onclick={() => showFieldModal = true}>
						View All
					</Button>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						{#each fields.slice(0, 4) as field, index}
							<div class="flex items-center gap-3 p-3 border rounded-md">
								<ToggleShadcn
									bind:rawValue={field.enabled}
									showValue={false}
									onChanged={(detail) => handleToggleChange(index, detail)}
								/>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium">{field.name}</span>
										{#if field.required}
											<Badge variant="destructive" class="text-xs">Required</Badge>
										{/if}
									</div>
									<p class="text-xs text-muted-foreground truncate">{field.description}</p>
								</div>
								{#if field.type !== 'checkbox' && field.enabled}
									<div class="w-32">
										<InputShadcn
											displayInterface={field.type}
											bind:rawValue={field.value}
											onChanged={(detail) => handleFieldChange(index, detail)}
										/>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Filters -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<div>
						<Card.Title>Active Filters</Card.Title>
						<Card.Description>Query filters and arguments</Card.Description>
					</div>
					<Button size="sm" onclick={() => showFilterModal = true}>
						Manage
					</Button>
				</Card.Header>
				<Card.Content>
					<div class="space-y-2">
						{#each filters as filter}
							<div class="flex items-center gap-2 p-2 border rounded-md">
								<ToggleShadcn
									bind:rawValue={filter.enabled}
									showValue={false}
								/>
								<div class="flex-1">
									<span class="text-sm font-medium">{filter.field}</span>
									<span class="text-xs text-muted-foreground mx-1">{filter.operator}</span>
									<Badge variant="outline" class="text-xs">{filter.value}</Badge>
								</div>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right Panel: Query & Results -->
		<div class="space-y-6">
			<!-- Generated Query -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Generated GraphQL Query</Card.Title>
					<Card.Description>
						{fields.filter(f => f.enabled).length} fields, {filters.filter(f => f.enabled).length} filters
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<pre class="p-4 bg-muted rounded-md overflow-x-auto text-sm"><code>{generatedQuery()}</code></pre>
					<div class="flex gap-2">
						<Button
							class="flex-1"
							onclick={executeQuery}
							disabled={isExecuting}
						>
							{isExecuting ? 'Executing...' : 'Execute Query'}
						</Button>
						<Button
							variant="outline"
							onclick={() => navigator.clipboard.writeText(generatedQuery())}
						>
							Copy
						</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Query Stats -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Query Statistics</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<p class="text-sm text-muted-foreground">Enabled Fields</p>
							<p class="text-2xl font-bold">{fields.filter(f => f.enabled).length}</p>
						</div>
						<div class="space-y-1">
							<p class="text-sm text-muted-foreground">Total Fields</p>
							<p class="text-2xl font-bold">{fields.length}</p>
						</div>
						<div class="space-y-1">
							<p class="text-sm text-muted-foreground">Active Filters</p>
							<p class="text-2xl font-bold">{filters.filter(f => f.enabled).length}</p>
						</div>
						<div class="space-y-1">
							<p class="text-sm text-muted-foreground">Cache Status</p>
							<Badge variant={formData.cacheEnabled ? "default" : "secondary"}>
								{formData.cacheEnabled ? "On" : "Off"}
							</Badge>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Integration Info -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Integration Components</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3 text-sm">
						<div class="flex items-start gap-2">
							<Badge>InputShadcn</Badge>
							<p class="text-muted-foreground">
								Maintains your existing API (displayInterface, rawValue, onChanged) with shadcn-svelte styling
							</p>
						</div>
						<div class="flex items-start gap-2">
							<Badge>ToggleShadcn</Badge>
							<p class="text-muted-foreground">
								Drop-in replacement for Toggle.svelte with useSwap mode support
							</p>
						</div>
						<div class="flex items-start gap-2">
							<Badge>ModalShadcn</Badge>
							<p class="text-muted-foreground">
								Compatible with your Modal API (onApply, onCancel, onMounted)
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<!-- Field Modal -->
{#if showFieldModal}
	<ModalShadcn
		modalIdetifier="fieldModal"
		bind:open={showFieldModal}
		showApplyBtn={false}
		onCancel={() => showFieldModal = false}
	>
		<Card.Root class="border-0 shadow-none">
			<Card.Header>
				<Card.Title>All Fields Configuration</Card.Title>
				<Card.Description>Configure all available query fields</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each fields as field, index}
						<div class="p-4 border rounded-md space-y-3">
							<div class="flex items-center justify-between">
								<div>
									<div class="flex items-center gap-2">
										<span class="font-medium">{field.name}</span>
										{#if field.required}
											<Badge variant="destructive" class="text-xs">Required</Badge>
										{/if}
									</div>
									<p class="text-sm text-muted-foreground">{field.description}</p>
								</div>
								<ToggleShadcn
									bind:rawValue={field.enabled}
									showValue={false}
									onChanged={(detail) => handleToggleChange(index, detail)}
								/>
							</div>
							{#if field.type !== 'checkbox' && field.enabled}
								<div class="space-y-2">
									<label class="text-sm font-medium">Value</label>
									<InputShadcn
										displayInterface={field.type}
										bind:rawValue={field.value}
										onChanged={(detail) => handleFieldChange(index, detail)}
									/>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</ModalShadcn>
{/if}

<!-- Filter Modal -->
{#if showFilterModal}
	<ModalShadcn
		modalIdetifier="filterModal"
		bind:open={showFilterModal}
		showApplyBtn={true}
		onApply={() => {
			console.log('Filters applied:', filters);
			showFilterModal = false;
		}}
		onCancel={() => showFilterModal = false}
	>
		<Card.Root class="border-0 shadow-none">
			<Card.Header>
				<Card.Title>Manage Filters</Card.Title>
				<Card.Description>Configure query filters and operators</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each filters as filter, index}
						<div class="p-4 border rounded-md space-y-3">
							<div class="flex items-center gap-3">
								<ToggleShadcn
									bind:rawValue={filter.enabled}
									showValue={false}
								/>
								<span class="font-medium">{filter.field}</span>
								<Badge variant="outline">{filter.operator}</Badge>
							</div>
							{#if filter.enabled}
								<div class="space-y-2">
									<label class="text-sm font-medium">Filter Value</label>
									<InputShadcn
										displayInterface="text"
										bind:rawValue={filter.value}
									/>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</ModalShadcn>
{/if}

<!-- Results Modal -->
{#if showResultsModal}
	<ModalShadcn
		modalIdetifier="resultsModal"
		bind:open={showResultsModal}
		showApplyBtn={false}
		onCancel={() => showResultsModal = false}
	>
		<Card.Root class="border-0 shadow-none">
			<Card.Header>
				<Card.Title>Query Results</Card.Title>
				<Card.Description>GraphQL query execution results</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if queryResult}
					<pre class="p-4 bg-muted rounded-md overflow-x-auto text-sm"><code>{JSON.stringify(queryResult, null, 2)}</code></pre>
				{:else}
					<p class="text-muted-foreground">No results</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</ModalShadcn>
{/if}
