<script>
	import { page } from '$app/stores';
	import TabItem from '$lib/components/TabItem.svelte';
	import { getQMSLinks } from '$lib/utils/usefulFunctions';
	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();
	console.log($page);
	let endpointId = $page.params.endpointId;
	export let endpointInfo;
	let links = [
		{
			title: 'Home',
			url: '/',
			urlIsRoute: true,
			icon: 'bi-house',
			isSelected: false,
			hasFill: true,
			items: []
		},
		{
			title: 'Queries',
			url: `/endpoints/${endpointId}/queries`,
			urlIsRoute: false,
			icon: 'bi bi-asterisk',
			isSelected: false,
			hasFill: false,
			items: getQMSLinks('query', '/queries', endpointInfo)
		},
		{
			title: 'Mutations',
			url: `/endpoints/${endpointId}/mutations`,
			urlIsRoute: false,
			icon: 'bi bi-pen',
			isSelected: false,
			hasFill: true,
			items: getQMSLinks('mutation', '/mutations', endpointInfo)
		},
		{
			title: 'Explorer',
			url: `/endpoints/${endpointId}/explorer`,
			urlIsRoute: false,
			icon: 'bi bi-compass',
			isSelected: false,
			hasFill: true,
			items: []
		}
	];

	let QueryLinks = getQMSLinks();
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

<div class="flex h-screen overscroll-contain">
	<div class="w-16 ">
		<div class="h-[50px] bg-primary ">
			<a href="/" class="block w-full h-full ">
				<img src="/png_website_logo_placeholder.png" alt="" class="w-full h-full" />
			</a>
		</div>
		<ul
			class="flex h-full w-16xxx flex-col  justify-start border-t-[1px] border-base-content border-opacity-5 bg-base-300   pt-1 pb-[25vh] overscroll-contain"
			on:click={() => {
				// if (itemsToShow.length == 0) {
				// 	dispatch('hideSidebar');
				// }
			}}
		>
			{#each links as link}
				<TabItem
					title={link.title}
					url={link.url}
					icon={link.icon}
					hasFill={link.hasFill}
					urlIsRoute={link.urlIsRoute}
				/>
			{/each}
		</ul>
	</div>

	{#if itemsToShow.length > 0}
		<div class="">
			<div class="h-[50px] bg-accent">{''}</div>
			<ul
				class="space-y-1 px-4 py-4 h-full overflow-y-auto  w-[60vw] md:w-full   overflow-x-auto  bg-base-100  grow pb-[25vh] overscroll-contain"
				on:click={() => {
					dispatch('hideSidebar');
				}}
			>
				{#each itemsToShow as item}
					<li class="md:w-[10vw] md:min-w-[170px] ">
						<a
							href={item.url}
							class="rounded hover:bg-info/50 text-base-content  break-allxxx truncate ...  block w-full h-full px-2  py-2 text-sm leading-tight {$page
								.url.pathname == item.url || $page.url.pathname.startsWith(`${item.url}/`)
								? 'font-bold bg-info/50 '
								: 'bg-info/5'}"
							title={item.title}>{item.title}</a
						>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div
		class="w-[100vw] h-screen  md:hidden "
		on:click={() => {
			dispatch('hideSidebar');
		}}
	/>
</div>

<style>
	.shadowTop {
		box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
	}
</style>
