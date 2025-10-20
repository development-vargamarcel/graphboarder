<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/index.js";
	import type { Snippet } from "svelte";

	interface Props extends DialogPrimitive.TitleProps {
		children?: Snippet;
	}

	let { class: className, level = "h3", children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Title
	{level}
	class={cn("text-lg font-semibold leading-none tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</DialogPrimitive.Title>
