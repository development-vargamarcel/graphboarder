<script>
	import { fly, fade, scale } from 'svelte/transition';
	import { detectSwipe } from '$lib/actions/detectSwipe.js';
	import {
		disableScrollHandling,
		goto,
		invalidate,
		prefetch,
		prefetchRoutes,
		beforeNavigate,
		afterNavigate
	} from '$app/navigation';
	import {
		backIn,
		backOut,
		elasticOut,
		backInOut,
		circIn,
		circOut,
		sineOut,
		sineIn
	} from 'svelte/easing';
	import { onMount } from 'svelte';

	import { page } from '$app/stores';
	let isVisible = true;
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	let apply = () => {
		dispatch('apply');
	};
	export let oneItem = false;
	let mainDivIntroEnd = false;
	let bodyDivIntroEnd = false;

	onMount(() => {
		goto('#modal');
	});

	beforeNavigate((e) => {
		if (e.from.pathname == e.to.pathname) {
			dispatch('cancel');
		}
	});

	const swipedown = (e) => {
		const parent = e.target.parentNode;
		const scrollTop = parent.scrollTop;

		if (scrollTop > 0) {
			parent.scrollTop = 0;
		} else {
			history.back();
		}
	};

	let mainDiv;
	let bodyDiv;
	let mainDivScrolled = false;
	$: if (bodyDiv) {
		mainDiv.scrollTop = 500;
		console.log('mainDiv.scrollTop = 0', mainDiv.scrollTop);
		mainDivScrolled = true;
	}
</script>

<!-- grid grid-cols-1 content-end -->
<div
	class="fixed top-0 left-0 z-40  h-screen  w-full overflow-y-scroll overscroll-contain scroll-smooth  bg-base-100/50  "
	bind:this={mainDiv}
	in:fade={{ delay: 0, duration: 200 }}
	out:fade={{ delay: 0, duration: 200 }}
	on:introend={() => (mainDivIntroEnd = true)}
>
	{#if mainDivIntroEnd}
		<div
			class="    {oneItem ? 'h-full w-full' : 'py-80'}"
			on:click|self={() => {
				history.back();
			}}
		/>
		<div
			bind:this={bodyDiv}
			use:detectSwipe
			on:swipedown={(e) => {
				swipedown(e);
			}}
			class="{oneItem ? 'fixed bottom-0 w-full' : ' '} shadowTop card-bordered card rounded-box z-50
			my-0 max-h-min space-y-0 rounded-b-none border-transparent bg-base-100 p-0 py-0  pb-24 "
			in:fly={{
				delay: 20,
				duration: 300,
				x: 0,
				y: 400,
				opacity: 0,
				start: 0,
				easing: sineOut
			}}
			out:fly={{ delay: 0, duration: 200, x: 0, y: 20, opacity: 0, start: 0, easing: sineIn }}
			on:introend={() => (bodyDivIntroEnd = true)}
		>
			<div class="sticky top-0  bg-base-100">
				<div class="{oneItem ? ' my-2 ' : 'my-4 h-2 bg-base-300'}    rounded-box mx-auto w-12  " />
			</div>

			<div class="px-3 pb-40">
				<slot />
			</div>
		</div>
	{/if}

	{#if mainDivScrolled}
		<div
			class="fixed bottom-0 z-50 w-full 	"
			in:fly={{ delay: 400, duration: 200, x: 0, y: 120, opacity: 1, start: 0, easing: sineOut }}
			out:fly={{ delay: 0, duration: 200, x: 0, y: 20, opacity: 0, start: 0, easing: sineIn }}
		>
			<!-- card-actions -->
			<div
				class="my-0  mx-auto w-full justify-center bg-gradient-to-t from-base-100/100 via-base-100/70 to-base-100/10 px-2 pb-0"
			>
				<div class=" mx-auto w-11/12    ">
					<button
						class="btn btn-primary btn-lg    w-full justify-center normal-case shadow-2xl drop-shadow-2xl "
						on:click={apply}>Apply</button
					>
				</div>
			</div>
			<div class="my-0 mx-auto w-full bg-base-100/100 py-4" />
		</div>
	{/if}
</div>

<style>
	.shadowTop {
		box-shadow: rgba(0, 0, 0, 0.5) 0px -6px 5px 0px;
	}
</style>
