<script>
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	/**
	 * @typedef {Object} Props
	 * @property {any} title
	 * @property {any} icon
	 * @property {any} url
	 * @property {boolean} [hasFill]
	 * @property {any} urlIsRoute
	 * @property {string} [target]
	 */

	/** @type {Props} */
	let {
		title,
		icon,
		url,
		hasFill = true,
		urlIsRoute,
		target = ''
	} = $props();
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
