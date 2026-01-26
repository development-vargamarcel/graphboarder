<script lang="ts">
	import { onMount } from 'svelte';
	import { Logger } from '$lib/utils/logger';

	// State for the current theme, defaults to 'light'
	let theme = $state('light');

	// Initialize theme on mount based on local storage or system preference
	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			theme = savedTheme;
		} else {
			// Check system preference
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				theme = 'dark';
			}
		}
		// Apply theme to document
		document.documentElement.setAttribute('data-theme', theme);
		Logger.debug('Theme initialized:', theme);
	});

	// Toggle between light and dark themes
	const toggleTheme = () => {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		Logger.info('Theme changed to:', theme);
	};
</script>

<button class="btn btn-ghost btn-circle" onclick={toggleTheme} aria-label="Toggle Theme">
	{#if theme === 'light'}
		<i class="bi bi-moon-fill text-lg"></i>
	{:else}
		<i class="bi bi-sun-fill text-lg"></i>
	{/if}
</button>
