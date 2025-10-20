<script lang="ts">
	import { Button as ButtonPrimitive } from "bits-ui";
	import { type Events, type Props, buttonVariants } from "./index.js";
	import { cn } from "$lib/utils/index.js";
	import type { Snippet } from "svelte";

	interface ButtonProps extends Props {
		children?: Snippet;
	}

	let {
		class: className,
		variant = "default",
		size = "default",
		builders = [],
		children,
		...restProps
	}: ButtonProps = $props();
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...restProps}
	onclick
	onkeydown
>
	{@render children?.()}
</ButtonPrimitive.Root>
