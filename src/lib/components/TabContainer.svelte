<script lang="ts">
	import { page } from '$app/stores';
	import TabItem from '$lib/components/TabItem.svelte';
	import TabButton from '$lib/components/TabButton.svelte';
	import HeadersEditor from '$lib/components/UI/HeadersEditor.svelte';
	import EndpointManager from '$lib/components/UI/EndpointManager.svelte';
	import { getQMSLinks } from '$lib/utils/usefulFunctions';
	import { getContext, onMount } from 'svelte';
	import { Logger } from '$lib/utils/logger';
	import type { QMSMainWraperContext } from '$lib/types/index';
	import { get } from 'svelte/store';

	const prefix = '';

	interface Props {
		endpointInfo: any;
		onHideSidebar?: () => void;
	}

	let { endpointInfo, onHideSidebar }: Props = $props();

	let showSettings = $state(false);
	let showEndpoints = $state(false);

	// Ensure prefix is defined or passed
	let context = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const schemaData = context?.schemaData;
	Logger.debug('page', $page);
	let endpointid = $derived($page.params.endpointid);

	$effect(() => {
		Logger.debug({ endpointid });
	});

	let links = $derived([
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
			url: `/endpoints/${endpointid}/queries`,
			urlIsRoute: false,
			icon: 'bi bi-asterisk',
			isSelected: false,
			hasFill: false,
			items: getQMSLinks('query', `/endpoints/${endpointid}/queries`, endpointInfo, schemaData)
		},
		{
			title: 'Mutations',
			url: `/endpoints/${endpointid}/mutations`,
			urlIsRoute: false,
			icon: 'bi bi-pen',
			isSelected: false,
			hasFill: true,
			items: getQMSLinks('mutation', `/endpoints/${endpointid}/mutations`, endpointInfo, schemaData)
		},
		{
			title: 'Explorer',
			url: `/endpoints/${endpointid}/explorer`,
			urlIsRoute: false,
			icon: 'bi bi-compass',
			isSelected: false,
			hasFill: true,
			items: []
		},
		{
			title: 'Schema',
			url: `/endpoints/${endpointid}/schema`,
			urlIsRoute: false,
			icon: 'bi bi-diagram-3',
			isSelected: false,
			hasFill: true,
			items: []
		}
	]);

	const get_itemsToShow = () => {
		return (itemsToShow =
			links.filter((link) => {
				return $page.url.pathname == link.url || $page.url.pathname.startsWith(`${link.url}/`);
			})[0]?.items ?? []);
	};
	onMount(() => {
		get_itemsToShow();
	});

	$effect(() => {
		if ($page.url.pathname) {
			get_itemsToShow();
		}
	});
	let itemsToShow = $state([]);
</script>

<div class="flex h-screen overscroll-contain">
	<div class="w-16">
		<div class="h-[50px] bg-primary">
			<a href="/" class="block w-full h-full">
				<img src="/png_website_logo_placeholder.png" alt="" class="w-full h-full" />
			</a>
		</div>
		<ul
			class="flex h-full w-16xxx flex-col justify-start border-t-[1px] border-base-content border-opacity-5 bg-base-300 pt-1 pb-[25vh] overscroll-contain"
		>
			{#each links as link}
				<TabItem
					title={link.title}
					url={link.url}
					icon={link.icon}
					hasFill={link.hasFill}
					urlIsRoute={link.urlIsRoute}
					target={(link as any)?.target}
				/>
			{/each}
			<div class="mt-auto pb-4">
				<TabButton
					title="Endpoints"
					icon="bi bi-hdd-network"
					isActive={showEndpoints}
					onclick={() => {
						showEndpoints = true;
						Logger.debug('Opening Endpoint Manager');
					}}
				/>
				<TabButton
					title="Headers"
					icon="bi bi-gear"
					isActive={showSettings}
					onclick={() => {
						showSettings = true;
						Logger.debug('Opening Headers Editor');
					}}
				/>
			</div>
		</ul>
	</div>

	{#if showEndpoints}
		<EndpointManager onClose={() => (showEndpoints = false)} />
	{/if}

	{#if showSettings}
		<HeadersEditor {endpointInfo} onClose={() => (showSettings = false)} />
	{/if}

	{#if itemsToShow.length > 0}
		<div class="">
			<div class="h-[50px] bg-accent">{''}</div>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<ul
				class="space-y-1 px-4 py-4 h-full overflow-y-auto w-[60vw] md:w-full overflow-x-auto bg-base-100 grow pb-[25vh] overscroll-contain"
				onclick={() => {
					onHideSidebar?.();
				}}
				role="presentation"
			>
				{#each itemsToShow as item}
					<li class="md:w-[10vw] md:min-w-[170px]">
						<a
							href={item.url}
							class="rounded hover:bg-info/50 text-base-content break-allxxx truncate ... block w-full h-full px-2 py-2 text-sm leading-tight {$page
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
		class="w-[100vw] h-screen md:hidden"
		role="button"
		tabindex="0"
		onclick={() => {
			onHideSidebar?.();
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				onHideSidebar?.();
			}
		}}
	></div>
</div>

<style>
	/* .shadowTop {
		box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
	} */
</style>
