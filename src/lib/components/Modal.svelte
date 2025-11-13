<script lang="ts">
	import { run, preventDefault, stopPropagation, self } from 'svelte/legacy';

	import { fly, fade, scale } from 'svelte/transition';
	import { detectSwipe } from '$lib/actions/detectSwipe';
	import { sineOut, sineIn } from 'svelte/easing';
	import { portal } from 'svelte-portal';
	import { onMount } from 'svelte';

	interface Props {
		modalIdetifier?: string;
		showApplyBtn?: boolean;
		children?: import('svelte').Snippet;
		onApply?: () => void;
		onMounted?: (detail: { modalIdetifier: string }) => void;
		onCancel?: (detail: { modalIdetifier: string }) => void;
	}

	let { modalIdetifier = 'modal', showApplyBtn = true, children, onApply, onMounted, onCancel }: Props = $props();

	let apply = () => {
		onApply?.();
	};
	onMount(() => {
		onMounted?.({ modalIdetifier });
	});
	let mainDivIntroEnd = $state(false);
	let bodyDivIntroEnd = $state(false);

	const swipedown = (e) => {
		const parent = e.target.parentNode;
		let targetId = e.target?.id;
		//console.log('modalIdetifiertargetId', modalIdetifier == targetId);
		onCancel?.({ modalIdetifier: targetId });
	};

	let mainDiv = $state();
	let bodyDiv = $state();
	let mainDivScrolled = $state(false);
	run(() => {
		if (bodyDiv) {
			mainDiv.scrollTop = 500;
			mainDivScrolled = true;
		}
	});
	//
</script>

<!-- grid grid-cols-1 content-end -->
<!-- scroll-smooth -->
<div
	class="fixed top-0 right-0 z-[99]  h-screen  w-screen lg:w-full  overflow-y-scroll overscroll-contain   bg-base-100/50   "
	use:portal={'body'}
	hidden
	bind:this={mainDiv}
	in:fade|global={{ delay: 0, duration: 50 }}
	out:fade|global={{ delay: 0, duration: 50 }}
	onintroend={() => (mainDivIntroEnd = true)}
	onclick={self(stopPropagation(preventDefault(() => {
		onCancel?.({ modalIdetifier });
	})))}
>
	{#if mainDivIntroEnd}
		<div
			class="    py-80"
			onclick={self(stopPropagation(preventDefault(() => {
				onCancel?.({ modalIdetifier });
			})))}
		></div>

		<div
			bind:this={bodyDiv}
			id={modalIdetifier}
			class=" shadowTop card-bordered card rounded-box z-[99]
			my-0 min-h-[80vh] max-h-min space-y-0 rounded-b-none border-transparent bg-base-100  mx-auto md:w-2/3 pb-8 "
			in:fly|global={{
				delay: 20,
				duration: 200,
				x: 0,
				y: 400,
				opacity: 0,
				start: 0,
				easing: sineOut
			}}
			out:fly|global={{ delay: 0, duration: 100, x: 0, y: 20, opacity: 0, start: 0, easing: sineIn }}
			onintroend={() => (bodyDivIntroEnd = true)}
		>
			<div class="sticky top-0  bg-base-100 rounded-xl z-50 ">
				<div class="my-4 h-2 bg-base-300    rounded-box mx-auto w-12  "></div>
			</div>

			<div class="px-3 pb-80 ">
				{@render children?.()}
			</div>
		</div>
	{/if}
	{#if showApplyBtn}
		<div class="fixed bottom-0  left-0 z-[99] w-full 	">
			<!-- card-actions -->
			<div
				class="my-0  mx-auto w-full  mx-auto justify-center bg-gradient-to-t from-base-100/100 via-base-100/70 to-base-100/10 px-2 pb-0 "
			>
				<div class=" mx-auto w-11/12    lg:pb-4 ">
					<button
						class="btn btn-primary btn-lg    w-full  mx-auto  justify-center normal-case shadow-2xl drop-shadow-2xl "
						onclick={apply}>Apply</button
					>
				</div>
			</div>
			<div class="my-0 mx-auto w-full bg-base-100/100 py-4"></div>
		</div>{/if}
</div>

<style>
	.shadowTop {
		box-shadow: rgba(0, 0, 0, 0.5) 0px -6px 5px 0px;
	}
</style>
