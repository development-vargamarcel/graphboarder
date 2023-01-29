<script>
	import { fade, scale } from 'svelte/transition';
	//import { cubicInOut } from 'svelte/easing';
	import { browser } from '$app/environment';

	import { onDestroy, onMount, beforeUpdate, afterUpdate } from 'svelte';
	import { goto } from '$app/navigation';
	import { showTabs } from '$lib/stores/showTabs';
	export let backPath;
	export let CustomId;
	export let MenuItem;
	export let RememberScroll = false;
	//showTabs.set(true); // must change this line !!!!!!!!!!!!!!

	let hasPreviousPage = false;
	if (browser) {
		hasPreviousPage = window.history.length == 1 ? false : true;
	}

	let backButtonClick = () => {
		if (browser) {
			if (hasPreviousPage) {
				window.history.back();
			} else {
				let path = backPath ? backPath : '/';
				goto(`${path}`, { replaceState: true });
			}
		}
	};

	/// scroll logic start b
	const storeScroll = () => {
		let mainEl = document.getElementById(CustomId);

		localStorage.setItem(CustomId, mainEl.scrollTop.toString());
	};
	const revertLastScroll = () => {
		let mainEl = document.getElementById(CustomId);

		let lastScroll = localStorage.getItem(CustomId);
		if (lastScroll) {
			mainEl.scrollTop = lastScroll;
		}
	};

	onDestroy(() => {
		if (browser) {
			if (!MenuItem) {
				showTabs.set(true);
			}
			if (RememberScroll) {
				let mainEl = document.getElementById(CustomId);
				if (mainEl) {
					localStorage.setItem(CustomId, mainEl.scrollTop.toString());
				}
			}
		}
	});
	onMount(() => {
		if (!MenuItem) {
			showTabs.set(false);
		}
		if (RememberScroll) {
			let mainEl = document.getElementById(CustomId);
			if (mainEl) {
				let lastScroll = localStorage.getItem(CustomId);
				if (lastScroll) {
					mainEl.scrollTop = lastScroll;
				}
			}
		}
	});

	/// scroll logic end
</script>

{#if MenuItem}
	<main
		in:fade={{ duration: 350, delay: 200 }}
		out:fade={{ duration: 200 }}
		id={CustomId}
		class=" z-0 h-screen w-full overflow-y-scrollxxx overflow-hidden "
	>
		<slot />
	</main>
{:else}
	<main
		in:scale={{ x: 200, duration: 300, opacity: 1, start: 0.97 }}
		out:scale={{ x: 300, duration: 300, opacity: 0, start: 0.97 }}
		id={CustomId}
		class="  overflow-y-scroll pb-96 fixed top-0 h-full w-full z-40 bg-base-100"
	>
		<div class="navbar sticky top-0 mb-2  bg-base-100   shadow-md text-base-content w-full z-50">
			<div class="flex-none ">
				<button class="btn btn-square btn-ghost" on:click={backButtonClick}>
					{#if hasPreviousPage}
						<i class="bi bi-chevron-left  text-success text-3xl font-black" />
					{:else if backPath}
						<i class="bi bi-box-arrow-left  text-success text-3xl font-black" />
					{:else}
						<i class="bi bi-house  text-success text-3xl font-black" />
					{/if}
				</button>
			</div>
			<div class="flex-1 px-2 mx-2 ">
				<span class="  text-lg font-bold"> With one icon </span>
			</div>
		</div>
		<slot />
	</main>
{/if}
