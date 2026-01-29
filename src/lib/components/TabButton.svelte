<script lang="ts">
	interface Props {
		title: string;
		icon: string;
		hasFill?: boolean;
		isActive?: boolean;
		onclick?: () => void;
	}

	let {
		title,
		icon,
		hasFill = true,
		isActive = false,
		onclick
	}: Props = $props();
</script>

<button
	onclick={onclick}
	class="{isActive
		? ' font-medium scale-110  bg-base-100'
		: ' opacity-50 '} w-full px-3 py-2 text-center text-base-content leading-none flex flex-col  mb-2  justify-center  text-xs hover:no-underline focus:no-underline mx-auto border-b-4 border-base-content border-opacity-0 active:border-opacity-100 transform  cursor-pointer  ease-out "
>
	<i
		class="{isActive && hasFill
			? icon + '-fill '
			: icon + '  '}  text-lg mx-auto leading-none"
	></i>
	{title}
</button>
