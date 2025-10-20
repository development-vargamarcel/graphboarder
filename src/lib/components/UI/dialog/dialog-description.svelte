<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/index.js";
	import type { Snippet } from "svelte";

	interface Props extends DialogPrimitive.DescriptionProps {
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Description class={cn("text-sm text-muted-foreground", className)} {...restProps}>
	{@render children?.()}
</DialogPrimitive.Description>
