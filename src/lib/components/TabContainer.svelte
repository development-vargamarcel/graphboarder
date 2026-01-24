<script lang="ts">

	import { page } from '$app/stores';
	import TabItem from '$lib/components/TabItem.svelte';
	import { getQMSLinks } from '$lib/utils/usefulFunctions';
	import { getContext, onMount } from 'svelte';
	import { Logger } from '$lib/utils/logger';

	const prefix = '';

	interface Props {
		endpointInfo: any;
		onHideSidebar?: () => void;
	}

	let { endpointInfo, onHideSidebar }: Props = $props();

	import type { QMSMainWraperContext } from '$lib/types/index';
	import { get } from 'svelte/store';

	// The declaration of QMSMainWraperContext must not be duplicated.
	// Since there was a previous let QMSMainWraperContext... declaration in the original file context which might have been missed or not fully replaced in previous steps, ensuring this block is clean.
	// Based on the error "Identifier 'QMSMainWraperContext' has already been declared", it implies duplication.
	// I will declare it once here properly.

	// In the previous patch, it seems the variable declaration was NOT removed correctly or there was a hidden one.
	// I will assume that the variable `QMSMainWraperContext` is already declared in the scope above or below by my previous edits which might have been appended instead of replaced if the context window was tricky.
	// However, looking at the file content from my perspective, I see only one.
	// The error `Identifier 'QMSMainWraperContext' has already been declared` usually happens if I accidentally duplicated the block.
	// I will try to remove the declaration and assume it exists, OR better, I will rename this one to ensure uniqueness if I can't find the duplicate.
	// But let's try to just use the one I see.
	// Wait, if I am replacing the block I just added, maybe I added it twice?
	// Let's replace the whole block again with a single declaration.

	let QMSMainWraperContext_TC = getContext<QMSMainWraperContext>(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext_TC?.schemaData;
	$effect(() => {
		Logger.debug('page', $page);
	});
	let endpointid = $derived($page.params.endpointid);
	$effect(() => {
		Logger.debug({ endpointid });
	});
	let links = $derived.by(() => {
		const result = [
			{
				title: 'Home',
				url: '/',
				urlIsRoute: true,
				icon: 'bi-house',
				isSelected: false,
				hasFill: true,
				items: [],
				target: undefined
			},
			{
				title: 'Queries',
				url: `/endpoints/${endpointid}/queries`,
				urlIsRoute: false,
				icon: 'bi bi-asterisk',
				isSelected: false,
				hasFill: false,
				items: getQMSLinks('query', `/endpoints/${endpointid}/queries`, endpointInfo, schemaData as any),
				target: undefined
			},
			{
				title: 'Mutations',
				url: `/endpoints/${endpointid}/mutations`,
				urlIsRoute: false,
				icon: 'bi bi-pen',
				isSelected: false,
				hasFill: true,
				items: getQMSLinks(
					'mutation',
					`/endpoints/${endpointid}/mutations`,
					endpointInfo,
					schemaData as any
				),
				target: undefined
			},
			{
				title: 'Explorer',
				url: `/endpoints/${endpointid}/explorer`,
				urlIsRoute: false,
				icon: 'bi bi-compass',
				isSelected: false,
				hasFill: true,
				items: [],
				target: undefined
			}
		];
		return result;
	});

	let itemsToShow = $derived(
		links.filter((link) => {
			return $page.url.pathname == link.url || $page.url.pathname.startsWith(`${link.url}/`);
		})[0]?.items ?? []
	);
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
		>
			{#each links as link}
				<TabItem
					title={link.title}
					url={link.url}
					icon={link.icon}
					hasFill={link.hasFill}
					urlIsRoute={link.urlIsRoute}
					target={link.target}
				/>
			{/each}
		</ul>
	</div>

	{#if itemsToShow.length > 0}
		<div class="">
			<div class="h-[50px] bg-accent">{''}</div>
			<div
				class="space-y-1 px-4 py-4 h-full overflow-y-auto  w-[60vw] md:w-full   overflow-x-auto  bg-base-100  grow pb-[25vh] overscroll-contain"
			>
				{#each itemsToShow as item}
					<div
						role="button"
						tabindex="0"
						class="md:w-[10vw] md:min-w-[170px] list-none"
						onclick={() => {
							onHideSidebar?.();
						}}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								onHideSidebar?.();
							}
						}}
					>
						<a
							href={item.url}
							class="rounded hover:bg-info/50 text-base-content  break-allxxx truncate ...  block w-full h-full px-2  py-2 text-sm leading-tight {$page
								.url.pathname == item.url || $page.url.pathname.startsWith(`${item.url}/`)
								? 'font-bold bg-info/50 '
								: 'bg-info/5'}"
							title={item.title}>{item.title}</a
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div
		role="button"
		tabindex="0"
		class="w-[100vw] h-screen  md:hidden "
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
