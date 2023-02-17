<script>
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let title;
	export let icon;
	export let url;
	export let hasFill = true;
	export let urlIsRoute;
	export let target = '';
</script>

<a
	data-sveltekit-prefetch
	href={url}
	{target}
	class="{$page.url.pathname.startsWith(url)
		? ' font-medium scale-110  bg-base-100'
		: ' opacity-50 '}  px-3 py-2 text-center text-base-content leading-none flex flex-col  mb-2  justify-center  text-xs hover:no-underline focus:no-underline mx-auto border-b-4 border-base-content border-opacity-0 active:border-opacity-100 transform  cursor-pointer  ease-out "
>
	<i
		class="{$page.url.pathname.startsWith(url) && hasFill
			? icon + '-fill '
			: icon + '  '}  text-lg mx-auto leading-none"
	/>
	{title}
</a>
