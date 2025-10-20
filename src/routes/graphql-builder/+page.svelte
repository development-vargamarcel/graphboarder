<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Switch } from "$lib/components/ui/switch";
	import { Textarea } from "$lib/components/ui/textarea";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Badge } from "$lib/components/ui/badge";

	// Mock endpoint data structure similar to your app
	let endpoints = $state([
		{
			id: "1",
			description: "Star Wars GraphQL API",
			url: "https://swapi-graphql.netlify.app/.netlify/functions/index",
			isActive: true
		},
		{
			id: "2",
			description: "Countries GraphQL API",
			url: "https://countries.trevorblades.com/",
			isActive: false
		},
		{
			id: "3",
			description: "SpaceX GraphQL API",
			url: "https://spacex-production.up.railway.app/",
			isActive: false
		}
	]);

	let selectedEndpoint = $state(endpoints[0]);
	let endpointDialogOpen = $state(false);

	// Query builder state
	let queryName = $state("getAllUsers");
	let selectedFields = $state<string[]>(["id", "name", "email"]);
	let availableFields = $state(["id", "name", "email", "username", "createdAt", "updatedAt", "posts", "comments"]);

	// Arguments/Filters
	let filters = $state([
		{ field: "status", operator: "equals", value: "active", enabled: true },
		{ field: "role", operator: "in", value: "admin,user", enabled: false }
	]);

	let addFilterDialogOpen = $state(false);
	let newFilter = $state({ field: "", operator: "equals", value: "", enabled: true });

	// Generated query
	let generatedQuery = $derived(() => {
		const activeFilters = filters.filter(f => f.enabled);
		const argsString = activeFilters.length > 0
			? `(${activeFilters.map(f => `${f.field}: "${f.value}"`).join(", ")})`
			: "";

		const fieldsString = selectedFields.join("\n    ");

		return `query ${queryName} {
  users${argsString} {
    ${fieldsString}
  }
}`;
	});

	// Query execution state
	let queryResult = $state<any>(null);
	let isExecuting = $state(false);
	let error = $state<string | null>(null);

	const executeQuery = async () => {
		isExecuting = true;
		error = null;

		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Mock response
		queryResult = {
			data: {
				users: [
					{ id: "1", name: "John Doe", email: "john@example.com", username: "johndoe" },
					{ id: "2", name: "Jane Smith", email: "jane@example.com", username: "janesmith" },
					{ id: "3", name: "Bob Johnson", email: "bob@example.com", username: "bobjohnson" }
				]
			}
		};

		isExecuting = false;
	};

	const toggleField = (field: string) => {
		if (selectedFields.includes(field)) {
			selectedFields = selectedFields.filter(f => f !== field);
		} else {
			selectedFields = [...selectedFields, field];
		}
	};

	const addFilter = () => {
		if (newFilter.field && newFilter.value) {
			filters = [...filters, { ...newFilter }];
			newFilter = { field: "", operator: "equals", value: "", enabled: true };
			addFilterDialogOpen = false;
		}
	};

	const removeFilter = (index: number) => {
		filters = filters.filter((_, i) => i !== index);
	};
</script>

<div class="container mx-auto p-6 space-y-6">
	<!-- Header -->
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">GraphQL Query Builder</h1>
		<p class="text-muted-foreground">
			Build and execute GraphQL queries with shadcn-svelte components
		</p>
	</div>

	<!-- Endpoint Selection -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Endpoint Configuration</Card.Title>
			<Card.Description>Select your GraphQL endpoint</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex items-center gap-2">
				<Badge variant={selectedEndpoint.isActive ? "default" : "secondary"}>
					{selectedEndpoint.isActive ? "Active" : "Inactive"}
				</Badge>
				<span class="text-sm font-medium">{selectedEndpoint.description}</span>
			</div>
			<div class="flex gap-2">
				<Input
					type="text"
					value={selectedEndpoint.url}
					readonly
					class="flex-1"
				/>
				<Button variant="outline" onclick={() => endpointDialogOpen = true}>
					Change
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Query Builder Panel -->
		<div class="space-y-6">
			<!-- Query Name -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Query Configuration</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-2">
						<label class="text-sm font-medium">Query Name</label>
						<Input
							type="text"
							bind:value={queryName}
							placeholder="Enter query name..."
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Field Selection -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Fields</Card.Title>
					<Card.Description>Select fields to include in the query</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-2 gap-2">
						{#each availableFields as field}
							<div class="flex items-center space-x-2">
								<Switch
									checked={selectedFields.includes(field)}
									onchange={() => toggleField(field)}
								/>
								<label class="text-sm font-medium">{field}</label>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Filters/Arguments -->
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<div>
						<Card.Title>Filters & Arguments</Card.Title>
						<Card.Description>Add query arguments and filters</Card.Description>
					</div>
					<Button size="sm" onclick={() => addFilterDialogOpen = true}>
						Add Filter
					</Button>
				</Card.Header>
				<Card.Content>
					{#if filters.length === 0}
						<p class="text-sm text-muted-foreground">No filters added yet</p>
					{:else}
						<div class="space-y-2">
							{#each filters as filter, index}
								<div class="flex items-center gap-2 p-2 border rounded-md">
									<Switch bind:checked={filter.enabled} />
									<div class="flex-1">
										<span class="text-sm font-medium">{filter.field}</span>
										<span class="text-sm text-muted-foreground"> {filter.operator} </span>
										<Badge variant="outline">{filter.value}</Badge>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => removeFilter(index)}
									>
										Remove
									</Button>
								</div>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Generated Query & Results Panel -->
		<div class="space-y-6">
			<!-- Generated Query -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Generated Query</Card.Title>
					<Card.Description>Your GraphQL query based on selections</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Textarea
						value={generatedQuery()}
						readonly
						class="font-mono text-sm min-h-[200px]"
					/>
					<div class="flex gap-2">
						<Button
							class="flex-1"
							onclick={executeQuery}
							disabled={isExecuting || selectedFields.length === 0}
						>
							{isExecuting ? "Executing..." : "Execute Query"}
						</Button>
						<Button
							variant="outline"
							onclick={() => {
								navigator.clipboard.writeText(generatedQuery());
							}}
						>
							Copy
						</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Query Results -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Query Results</Card.Title>
					<Card.Description>
						{#if isExecuting}
							Executing query...
						{:else if error}
							Error occurred
						{:else if queryResult}
							{queryResult.data.users.length} results
						{:else}
							No results yet
						{/if}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if error}
						<div class="p-4 border border-destructive rounded-md bg-destructive/10">
							<p class="text-sm text-destructive">{error}</p>
						</div>
					{:else if queryResult}
						<div class="space-y-2">
							<Textarea
								value={JSON.stringify(queryResult, null, 2)}
								readonly
								class="font-mono text-sm min-h-[300px]"
							/>
						</div>
					{:else}
						<div class="text-center py-12 text-muted-foreground">
							<p>Execute a query to see results</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<!-- Endpoint Selection Dialog -->
<Dialog.Root bind:open={endpointDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Select Endpoint</Dialog.Title>
			<Dialog.Description>
				Choose a GraphQL endpoint to query
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-2">
			{#each endpoints as endpoint}
				<button
					class="w-full p-4 text-left border rounded-md hover:bg-accent transition-colors {selectedEndpoint.id === endpoint.id ? 'border-primary bg-accent' : ''}"
					onclick={() => {
						selectedEndpoint = endpoint;
						endpointDialogOpen = false;
					}}
				>
					<div class="flex items-center gap-2 mb-1">
						<Badge variant={endpoint.isActive ? "default" : "secondary"} class="text-xs">
							{endpoint.isActive ? "Active" : "Inactive"}
						</Badge>
						<span class="font-medium">{endpoint.description}</span>
					</div>
					<p class="text-sm text-muted-foreground break-all">{endpoint.url}</p>
				</button>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- Add Filter Dialog -->
<Dialog.Root bind:open={addFilterDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Filter</Dialog.Title>
			<Dialog.Description>
				Add a new filter to your query
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4">
			<div class="space-y-2">
				<label class="text-sm font-medium">Field</label>
				<Input
					type="text"
					bind:value={newFilter.field}
					placeholder="e.g., status, role, id"
				/>
			</div>
			<div class="space-y-2">
				<label class="text-sm font-medium">Operator</label>
				<select
					bind:value={newFilter.operator}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
				>
					<option value="equals">Equals</option>
					<option value="in">In</option>
					<option value="contains">Contains</option>
					<option value="gt">Greater Than</option>
					<option value="lt">Less Than</option>
				</select>
			</div>
			<div class="space-y-2">
				<label class="text-sm font-medium">Value</label>
				<Input
					type="text"
					bind:value={newFilter.value}
					placeholder="Filter value"
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => addFilterDialogOpen = false}>
				Cancel
			</Button>
			<Button onclick={addFilter} disabled={!newFilter.field || !newFilter.value}>
				Add Filter
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
