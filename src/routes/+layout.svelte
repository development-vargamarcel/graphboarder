<script lang="ts">
	import '../app.postcss';
	import Header from '$lib/header/Header.svelte';
	import CommandPalette from '$lib/components/UI/CommandPalette.svelte';
	import { commandPaletteStore } from '$lib/stores/commandPalette';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	$effect(() => {
		if (browser) {
			commandPaletteStore.registerCommand({
				id: 'nav-home',
				title: 'Home',
				category: 'Navigation',
				description: 'Go to the home page',
				icon: 'bi bi-house',
				action: () => goto('/')
			});

			commandPaletteStore.registerCommand({
				id: 'nav-endpoints',
				title: 'Endpoints Manager',
				category: 'Navigation',
				description: 'Manage GraphQL endpoints',
				icon: 'bi bi-hdd-network',
				action: () => goto('/endpoints')
			});
		}
	});
</script>

<Header />
<CommandPalette />

{@render children?.()}
<footer></footer>

<style>
</style>
