<script lang="ts">
	import IntrospectionDataGenerator from '$lib/components/IntrospectionDataGenerator.svelte';

	import Header from '$lib/header/Header.svelte';
	import '../app.css';
	import { introspectionResult } from '$lib/stores/introspectionResult';

	let gotData = false;
	let introspectionResultUnsubscribe = introspectionResult.subscribe((data) => {
		if (data?.rootTypes.length > 0) {
			gotData = true;
		}
	});
</script>

<header />

<main>
	<IntrospectionDataGenerator />

	{#if gotData}
		<slot />
	{/if}
</main>

<footer />

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
