<script>
	import { browser } from '$app/env';

	let links = [
		{ title: 'Home', url: '/', icon: 'bi-house', hasFill: true },
		{ title: 'Queries', url: '/queries', icon: 'bi bi-asterisk', hasFill: false },

		{ title: 'More', url: '/private_area/more', icon: 'bi-three-dots', hasFill: false }
	];

	import TabItem from '$lib/components/TabItem.svelte';
</script>

<ul
	class="flex h-max w-full flex-auto  justify-center border-t-[1px] border-base-content border-opacity-5 bg-base-100 px-3 "
>
	{#each links as link}
		<TabItem title={link.title} url={link.url} icon={link.icon} hasFill={link.hasFill} />
	{/each}
</ul>

<style>
	.shadowTop {
		box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
	}
</style>
