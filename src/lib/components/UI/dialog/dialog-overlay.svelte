<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/index.js";
	import { fade } from "svelte/transition";

	interface Props extends DialogPrimitive.OverlayProps {}

	let {
		class: className,
		transition = fade,
		transitionConfig = { duration: 150 },
		...restProps
	}: Props = $props();
</script>

<DialogPrimitive.Overlay
	{transition}
	{transitionConfig}
	class={cn(
		"fixed inset-0 z-50 bg-black/80",
		className
	)}
	{...restProps}
/>
