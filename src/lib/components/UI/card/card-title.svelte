<script lang="ts">
	import { cn } from "$lib/utils/index.js";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		children?: Snippet;
		tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	}

	let { class: className, tag = "h3", children, ...restProps }: Props = $props();
</script>

<svelte:element
	this={tag}
	class={cn("text-2xl font-semibold leading-none tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
