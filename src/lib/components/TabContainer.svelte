<script>
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import TabItem from '$lib/components/TabItem.svelte';
	import { getQueryLinks } from '$lib/utils/usefulFunctions';
	import { onMount } from 'svelte';
	let links = [
		{ title: 'Home', url: '/', icon: 'bi-house', isSelected: false, hasFill: true, items: [] },
		{
			title: 'Queries',
			url: '/queries',
			icon: 'bi bi-asterisk',
			isSelected: false,
			hasFill: false,
			items: getQueryLinks()
		}
	];

	let QueryLinks = getQueryLinks();
	console.log({ QueryLinks });
	const get_itemsToShow = () => {
		return (itemsToShow =
			links.filter((link) => {
				return $page.url.pathname == link.url || $page.url.pathname.startsWith(`${link.url}/`);
			})[0]?.items ?? []);
	};
	onMount(() => {
		get_itemsToShow();
	});

	$: if ($page.url.pathname) {
		get_itemsToShow();
	}
	let itemsToShow = [];
</script>

<div class="flex ">
	<ul
		class="flex h-screen w-16 flex-col  justify-start border-t-[1px] border-base-content border-opacity-5 bg-base-300  h-screen"
	>
		{#each links as link}
			<TabItem title={link.title} url={link.url} icon={link.icon} hasFill={link.hasFill} />
		{/each}
	</ul>

	{#if itemsToShow.length > 0}
		<ul
			class="space-y-2 px-4 py-4 h-screen overflow-y-auto  w-[60vw] md:w-full   overflow-x-auto  bg-base-100 grow"
		>
			{#each itemsToShow as item}
				<li class=" ">
					<a
						href={item.url}
						class="rounded hover:bg-info/50 text-base-content  break-all block w-full h-full px-2 text-sm leading-tight {$page
							.url.pathname == item.url || $page.url.pathname.startsWith(`${item.url}/`)
							? 'font-bold bg-info/50 '
							: ''}">{item.title}</a
					>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="w-[30vw] h-screen  md:hidden" />
</div>

<style>
	.shadowTop {
		box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
	}
</style>
