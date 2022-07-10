<script>
	import { page } from '$app/stores';

	export let title;
	export let icon;
	export let url;
	export let hasFill = true;
</script>

<a
	sveltekit:prefetch
	href={url}
	class="{$page.url.pathname === url
		? ' font-medium scale-110  '
		: ' opacity-50 '} text-center text-base-content leading-none flex flex-col flex-auto mb-2 mt-1 justify-center  text-xs hover:no-underline focus:no-underline mx-auto border-b-4 border-base-content border-opacity-0 active:border-opacity-100 transform  cursor-pointer  ease-out duration-700"
>
	<i
		class="{$page.url.pathname === url && hasFill
			? icon + '-fill '
			: icon + '  '}  text-lg mx-auto leading-none"
	/>
	{title}
</a>
