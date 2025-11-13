<script lang="ts">
	import { page } from '$app/stores';
	interface Props {
		title: any;
		icon: any;
		url: any;
		hasFill?: boolean;
		urlIsRoute: any;
		target?: string;
	}

	let {
		title,
		icon,
		url,
		hasFill = true,
		urlIsRoute,
		target = ''
	}: Props = $props();
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
	></i>
	{title}
</a>
