<script lang="ts">
	import '../app.postcss';
	import Header from '$lib/header/Header.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Header />

{@render children?.()}
<footer></footer>

<style>
</style>
