<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
	import type { Snippet } from "svelte";

	interface Props {
		modalIdetifier?: string;
		showApplyBtn?: boolean;
		children?: Snippet;
		open?: boolean;
		onApply?: () => void;
		onCancel?: (event: { modalIdetifier: string }) => void;
		onMounted?: (event: { modalIdetifier: string }) => void;
	}

	let {
		modalIdetifier = 'modal',
		showApplyBtn = true,
		children,
		open = $bindable(true),
		onApply,
		onCancel,
		onMounted
	}: Props = $props();

	// Call onMounted when component is created
	$effect(() => {
		onMounted?.({ modalIdetifier });
	});

	const handleCancel = () => {
		open = false;
		onCancel?.({ modalIdetifier });
	};

	const handleApply = () => {
		onApply?.();
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<!-- Drag handle indicator (mimics your original design) -->
		<div class="flex justify-center mb-4">
			<div class="h-1.5 w-12 bg-muted rounded-full"></div>
		</div>

		<!-- Content -->
		<div class="px-1">
			{@render children?.()}
		</div>

		<!-- Apply button at bottom (if enabled) -->
		{#if showApplyBtn}
			<div class="sticky bottom-0 left-0 w-full mt-6">
				<div class="bg-gradient-to-t from-background via-background/90 to-background/0 px-2 pb-2">
					<Button
						class="w-full shadow-lg"
						size="lg"
						onclick={handleApply}
					>
						Apply
					</Button>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
