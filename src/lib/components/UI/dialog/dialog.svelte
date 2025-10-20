<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import * as Dialog from "./index.js";
	import type { Snippet } from "svelte";

	interface Props extends DialogPrimitive.Props {
		children?: Snippet;
	}

	let { children, ...restProps }: Props = $props();
</script>

<DialogPrimitive.Root {...restProps}>
	{@render children?.()}
</DialogPrimitive.Root>
