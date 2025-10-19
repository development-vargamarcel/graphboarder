<script lang="ts">
	import '../app.postcss';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<header></header>

{@render children?.()}
<footer></footer>

<style>
</style>
