<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import ArgInfoDisplay from "$lib/components/ArgInfoDisplay.svelte";
	import ArgInfoDisplayShadcn from "$lib/components/ArgInfoDisplayShadcn.svelte";
	import { setContext } from "svelte";
	import { writable } from "svelte/store";

	// Mock schema data and context
	const mockSchemaData = {
		get_rootType: () => null,
		rootTypes: []
	};

	setContext('QMSMainWraperContext', {
		schemaData: mockSchemaData
	});

	// Mock argument types for demonstration
	let mockArgs = $state([
		{
			dd_kindsArray: ['SCALAR'],
			dd_namesArray: ['String'],
			dd_rootName: 'String',
			dd_displayName: 'id',
			dd_kindList: false,
			dd_kindEl: 'SCALAR',
			dd_NON_NULL: true,
			dd_canExpand: false,
			dd_shouldExpand: false,
			dd_filterOperators: []
		},
		{
			dd_kindsArray: ['INPUT_OBJECT'],
			dd_namesArray: ['UserInput'],
			dd_rootName: 'UserInput',
			dd_displayName: 'user',
			dd_kindList: false,
			dd_kindEl: 'INPUT_OBJECT',
			dd_NON_NULL: false,
			dd_canExpand: true,
			dd_shouldExpand: true,
			dd_filterOperators: []
		},
		{
			dd_kindsArray: ['LIST', 'SCALAR'],
			dd_namesArray: ['String'],
			dd_rootName: 'String',
			dd_displayName: 'tags',
			dd_kindList: true,
			dd_kindEl: 'SCALAR',
			dd_NON_NULL: false,
			dd_canExpand: false,
			dd_shouldExpand: false,
			dd_filterOperators: []
		},
		{
			dd_kindsArray: ['INPUT_OBJECT'],
			dd_namesArray: ['FilterInput'],
			dd_rootName: 'FilterInput',
			dd_displayName: 'where',
			dd_kindList: false,
			dd_kindEl: 'INPUT_OBJECT',
			dd_NON_NULL: false,
			dd_canExpand: true,
			dd_shouldExpand: true,
			dd_filterOperators: ['_and', '_or', '_not']
		}
	]);

	let stepsOfFields = $state([]);
	let showExpand = $state(false);

	const expand = () => {
		showExpand = !showExpand;
	};
</script>

<div class="container mx-auto p-6 space-y-6">
	<!-- Header -->
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">Component Migration Comparison</h1>
		<p class="text-muted-foreground">
			Side-by-side comparison of ArgInfoDisplay: DaisyUI vs shadcn-svelte
		</p>
		<div class="flex gap-2">
			<Badge variant="outline">Before</Badge>
			<Badge>After</Badge>
		</div>
	</div>

	<!-- Migration Overview -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Migration Summary</Card.Title>
			<Card.Description>What changed in this complex component</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-3">
					<h3 class="font-semibold flex items-center gap-2">
						<Badge variant="outline">Before (DaisyUI)</Badge>
					</h3>
					<ul class="space-y-2 text-sm">
						<li class="flex items-start gap-2">
							<span class="text-destructive">→</span>
							<span><code class="bg-muted px-1">btn btn-xs</code> classes</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-destructive">→</span>
							<span><code class="bg-muted px-1">bg-secondary</code> for badges</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-destructive">→</span>
							<span>Manual hover states with Tailwind</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-destructive">→</span>
							<span>Inline button styling</span>
						</li>
					</ul>
				</div>

				<div class="space-y-3">
					<h3 class="font-semibold flex items-center gap-2">
						<Badge>After (shadcn-svelte)</Badge>
					</h3>
					<ul class="space-y-2 text-sm">
						<li class="flex items-start gap-2">
							<span class="text-primary">✓</span>
							<span><code class="bg-muted px-1">&lt;Button&gt;</code> component with variants</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-primary">✓</span>
							<span><code class="bg-muted px-1">&lt;Badge&gt;</code> component with variants</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-primary">✓</span>
							<span>Built-in hover and focus states</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-primary">✓</span>
							<span>Consistent sizing and spacing</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-primary">✓</span>
							<span>Better accessibility (ARIA attributes)</span>
						</li>
					</ul>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Template 'default' Comparison -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					Template: 'default'
					<Badge variant="outline">Before</Badge>
				</Card.Title>
				<Card.Description>Original DaisyUI implementation</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#each mockArgs.slice(0, 2) as arg, index}
					<div class="border rounded-md p-3 bg-muted/50">
						<ArgInfoDisplay
							{expand}
							{showExpand}
							{index}
							type={arg}
							template="default"
							bind:stepsOfFields
							predefinedFirstSteps={[]}
							groupName="test"
							on:argAddRequest={(e) => console.log('Arg request:', e.detail)}
							on:containerAddRequest={(e) => console.log('Container request:', e.detail)}
						/>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					Template: 'default'
					<Badge>After</Badge>
				</Card.Title>
				<Card.Description>New shadcn-svelte implementation</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				{#each mockArgs.slice(0, 2) as arg, index}
					<div class="border rounded-md p-3">
						<ArgInfoDisplayShadcn
							{expand}
							{showExpand}
							{index}
							type={arg}
							template="default"
							bind:stepsOfFields
							predefinedFirstSteps={[]}
							groupName="test"
							on:argAddRequest={(e) => console.log('Arg request:', e.detail)}
							on:containerAddRequest={(e) => console.log('Container request:', e.detail)}
						/>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Template 'changeArguments' Comparison -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					Template: 'changeArguments'
					<Badge variant="outline">Before</Badge>
				</Card.Title>
				<Card.Description>Argument selector list (original)</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#each mockArgs as arg, index}
					<ArgInfoDisplay
						{expand}
						{showExpand}
						{index}
						type={arg}
						template="changeArguments"
						bind:stepsOfFields
						predefinedFirstSteps={[]}
						groupName="test"
						on:argAddRequest={(e) => console.log('Arg request:', e.detail)}
						on:containerAddRequest={(e) => console.log('Container request:', e.detail)}
					/>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					Template: 'changeArguments'
					<Badge>After</Badge>
				</Card.Title>
				<Card.Description>Argument selector list (shadcn-svelte)</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#each mockArgs as arg, index}
					<ArgInfoDisplayShadcn
						{expand}
						{showExpand}
						{index}
						type={arg}
						template="changeArguments"
						bind:stepsOfFields
						predefinedFirstSteps={[]}
						groupName="test"
						on:argAddRequest={(e) => console.log('Arg request:', e.detail)}
						on:containerAddRequest={(e) => console.log('Container request:', e.detail)}
					/>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Code Comparison -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Code Changes</Card.Title>
			<Card.Description>Key differences in the implementation</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<h3 class="font-semibold text-sm">Buttons</h3>
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div>
						<Badge variant="outline" class="mb-2">Before</Badge>
						<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>{`<div class="btn btn-xs p-1 rounded">
  {showExpand ? '-' : '+'}
</div>`}</code></pre>
					</div>
					<div>
						<Badge class="mb-2">After</Badge>
						<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>{`<Button size="sm" variant="outline"
        class="h-8 w-8 p-0">
  {showExpand ? '-' : '+'}
</Button>`}</code></pre>
					</div>
				</div>
			</div>

			<div class="space-y-2">
				<h3 class="font-semibold text-sm">Badges/Labels</h3>
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div>
						<Badge variant="outline" class="mb-2">Before</Badge>
						<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>{`<div class="bg-secondary p-1 rounded">
  {index + 1}
</div>`}</code></pre>
					</div>
					<div>
						<Badge class="mb-2">After</Badge>
						<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>{`<Badge variant="secondary">
  {index + 1}
</Badge>`}</code></pre>
					</div>
				</div>
			</div>

			<div class="space-y-2">
				<h3 class="font-semibold text-sm">Interactive List Items</h3>
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div>
						<Badge variant="outline" class="mb-2">Before</Badge>
						<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>{`<label class="cursor-pointer
  hover:text-primary px-2 py-2
  rounded-box flex">`}</code></pre>
					</div>
					<div>
						<Badge class="mb-2">After</Badge>
						<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto"><code>{`<button class="cursor-pointer
  hover:bg-accent
  hover:text-accent-foreground
  px-3 py-2.5 rounded-md flex
  transition-colors border
  hover:border-border">`}</code></pre>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Benefits -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Migration Benefits</Card.Title>
			<Card.Description>What you gain from this migration</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="space-y-2">
					<h3 class="font-semibold flex items-center gap-2">
						<Badge>Consistency</Badge>
					</h3>
					<ul class="space-y-1 text-sm text-muted-foreground">
						<li>• Uniform button sizes</li>
						<li>• Consistent spacing</li>
						<li>• Predictable colors</li>
					</ul>
				</div>

				<div class="space-y-2">
					<h3 class="font-semibold flex items-center gap-2">
						<Badge>Accessibility</Badge>
					</h3>
					<ul class="space-y-1 text-sm text-muted-foreground">
						<li>• Proper ARIA labels</li>
						<li>• Focus management</li>
						<li>• Keyboard navigation</li>
					</ul>
				</div>

				<div class="space-y-2">
					<h3 class="font-semibold flex items-center gap-2">
						<Badge>Developer Experience</Badge>
					</h3>
					<ul class="space-y-1 text-sm text-muted-foreground">
						<li>• TypeScript support</li>
						<li>• Better autocomplete</li>
						<li>• Clear prop types</li>
					</ul>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Next Steps -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Next Steps for Your Migration</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<p class="text-sm text-muted-foreground">
				This component demonstrates a complete migration of a complex, real-world component.
				The same patterns can be applied to other components in your app.
			</p>

			<div class="space-y-2">
				<h3 class="font-semibold text-sm">To migrate this component in your actual app:</h3>
				<ol class="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
					<li>Replace imports: <code class="bg-muted px-1">ArgInfoDisplay</code> → <code class="bg-muted px-1">ArgInfoDisplayShadcn</code></li>
					<li>Test with real data to ensure all variants work</li>
					<li>Check event handlers still fire correctly</li>
					<li>Verify nested components render properly</li>
					<li>Remove old component once confirmed working</li>
				</ol>
			</div>

			<div class="flex gap-2 pt-4">
				<Button variant="outline" onclick={() => window.open('/endpoints', '_blank')}>
					View Updated Endpoints Page
				</Button>
				<Button onclick={() => window.open('/integration-demo', '_blank')}>
					View Integration Demo
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
