<script>
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let title;
	export let icon;
	export let url;
	export let hasFill = true;

</script>

<!-- <a
	sveltekit:prefetch
	href={url}
	class="{$page.url.pathname?.split('/')?.[1] === url?.split('/')?.[1]
		? ' font-medium scale-110  '
		: ' opacity-50 '}  text-center text-base-content leading-none flex flex-col  mb-2 mt-1 justify-center  text-xs hover:no-underline focus:no-underline mx-auto border-b-4 border-base-content border-opacity-0 active:border-opacity-100 transform  cursor-pointer  ease-out duration-700"
>	s</a> -->
<a
	sveltekit:prefetch
	href={url}
	class="{$page.url.pathname === url
		? ' font-medium scale-110  bg-base-100'
		: ' opacity-50 '} px-3 py-2 text-center text-base-content leading-none flex flex-col  mb-2 mt-1 justify-center  text-xs hover:no-underline focus:no-underline mx-auto border-b-4 border-base-content border-opacity-0 active:border-opacity-100 transform  cursor-pointer  ease-out "
>
	<i
		class="{$page.url.pathname === url && hasFill
			? icon + '-fill '
			: icon + '  '}  text-lg mx-auto leading-none"
	/>
	{title}
</a>
