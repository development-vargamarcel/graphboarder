<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Switch } from "$lib/components/ui/switch";
	import * as Dialog from "$lib/components/ui/dialog";

	let inputValue = $state("");
	let numberValue = $state(0);
	let switchChecked = $state(false);
	let dialogOpen = $state(false);
	let formData = $state({
		name: "",
		email: "",
		notifications: false
	});
</script>

<div class="container mx-auto p-8 space-y-8">
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">shadcn-svelte Components Demo</h1>
		<p class="text-muted-foreground">
			Explore the shadcn-svelte components integrated into your GraphBoarder project
		</p>
	</div>

	<!-- Button Section -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold border-b pb-2">Buttons</h2>

		<div class="space-y-2">
			<h3 class="text-lg font-medium">Variants</h3>
			<div class="flex flex-wrap gap-4">
				<Button>Default Button</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
			</div>
		</div>

		<div class="space-y-2">
			<h3 class="text-lg font-medium">Sizes</h3>
			<div class="flex flex-wrap items-center gap-4">
				<Button size="sm">Small</Button>
				<Button size="default">Default</Button>
				<Button size="lg">Large</Button>
				<Button size="icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M5 12h14" />
						<path d="M12 5v14" />
					</svg>
				</Button>
			</div>
		</div>
	</section>

	<!-- Input Section -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold border-b pb-2">Inputs</h2>

		<div class="space-y-4 max-w-md">
			<div class="space-y-2">
				<label class="text-sm font-medium" for="text-input">Text Input</label>
				<Input
					id="text-input"
					type="text"
					placeholder="Enter some text..."
					bind:value={inputValue}
				/>
				<p class="text-sm text-muted-foreground">Value: {inputValue || '(empty)'}</p>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium" for="number-input">Number Input</label>
				<Input
					id="number-input"
					type="number"
					placeholder="Enter a number..."
					bind:value={numberValue}
				/>
				<p class="text-sm text-muted-foreground">Value: {numberValue}</p>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium" for="email-input">Email Input</label>
				<Input
					id="email-input"
					type="email"
					placeholder="email@example.com"
				/>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium" for="password-input">Password Input</label>
				<Input
					id="password-input"
					type="password"
					placeholder="Enter password..."
				/>
			</div>

			<div class="space-y-2">
				<label class="text-sm font-medium" for="disabled-input">Disabled Input</label>
				<Input
					id="disabled-input"
					type="text"
					placeholder="This is disabled"
					disabled
				/>
			</div>
		</div>
	</section>

	<!-- Switch Section -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold border-b pb-2">Switches</h2>

		<div class="space-y-4 max-w-md">
			<div class="flex items-center justify-between">
				<label class="text-sm font-medium">Simple Switch</label>
				<Switch bind:checked={switchChecked} />
			</div>
			<p class="text-sm text-muted-foreground">Status: {switchChecked ? 'On' : 'Off'}</p>

			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<label class="text-sm font-medium">Notifications</label>
					<p class="text-sm text-muted-foreground">Receive email notifications</p>
				</div>
				<Switch />
			</div>

			<div class="flex items-center justify-between opacity-50">
				<label class="text-sm font-medium">Disabled Switch</label>
				<Switch disabled checked={true} />
			</div>
		</div>
	</section>

	<!-- Dialog Section -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold border-b pb-2">Dialog (Modal)</h2>

		<div class="space-y-4">
			<p class="text-sm text-muted-foreground">
				This is the shadcn-svelte Dialog component - a modern replacement for your existing Modal component
			</p>

			<Dialog.Root bind:open={dialogOpen}>
				<Dialog.Trigger>
					<Button>Open Dialog</Button>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Edit Profile</Dialog.Title>
						<Dialog.Description>
							Make changes to your profile here. Click save when you're done.
						</Dialog.Description>
					</Dialog.Header>

					<div class="space-y-4 py-4">
						<div class="space-y-2">
							<label class="text-sm font-medium" for="dialog-name">Name</label>
							<Input
								id="dialog-name"
								placeholder="Enter your name"
								bind:value={formData.name}
							/>
						</div>
						<div class="space-y-2">
							<label class="text-sm font-medium" for="dialog-email">Email</label>
							<Input
								id="dialog-email"
								type="email"
								placeholder="Enter your email"
								bind:value={formData.email}
							/>
						</div>
						<div class="flex items-center justify-between">
							<label class="text-sm font-medium">Enable Notifications</label>
							<Switch bind:checked={formData.notifications} />
						</div>
					</div>

					<Dialog.Footer>
						<Button
							variant="outline"
							onclick={() => {
								dialogOpen = false;
							}}
						>
							Cancel
						</Button>
						<Button
							onclick={() => {
								alert(`Saved!\nName: ${formData.name}\nEmail: ${formData.email}\nNotifications: ${formData.notifications}`);
								dialogOpen = false;
							}}
						>
							Save Changes
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>

			<Button
				variant="secondary"
				onclick={() => {
					dialogOpen = true;
				}}
			>
				Open via State
			</Button>
		</div>
	</section>

	<!-- Migration Guide -->
	<section class="space-y-4">
		<h2 class="text-2xl font-semibold border-b pb-2">Migration Guide</h2>

		<div class="space-y-4 bg-muted p-6 rounded-lg">
			<h3 class="text-lg font-semibold">How to use these components in your app:</h3>

			<div class="space-y-4 text-sm">
				<div>
					<h4 class="font-medium mb-2">1. Import the components:</h4>
					<pre class="bg-background p-3 rounded overflow-x-auto"><code>{`import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Switch } from "$lib/components/ui/switch";
import * as Dialog from "$lib/components/ui/dialog";`}</code></pre>
				</div>

				<div>
					<h4 class="font-medium mb-2">2. Replace existing components:</h4>
					<ul class="list-disc pl-6 space-y-1">
						<li><code>Modal.svelte</code> → <code>Dialog</code> component</li>
						<li><code>fields/Input.svelte</code> → <code>Input</code> component</li>
						<li><code>fields/Toggle.svelte</code> → <code>Switch</code> component</li>
						<li>DaisyUI buttons → shadcn-svelte <code>Button</code> component</li>
					</ul>
				</div>

				<div>
					<h4 class="font-medium mb-2">3. Benefits:</h4>
					<ul class="list-disc pl-6 space-y-1">
						<li>Fully Svelte 5 compatible with runes</li>
						<li>Accessible by default (ARIA compliant)</li>
						<li>Consistent design system</li>
						<li>Customizable with Tailwind classes</li>
						<li>TypeScript support out of the box</li>
					</ul>
				</div>
			</div>
		</div>
	</section>
</div>
