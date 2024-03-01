<script>
	import { createEventDispatcher } from 'svelte';

	export let displayInterface;
	let toggleEl;
	let swapEl;
	export let rawValue = true;
	export let showValue = true;
	export let otherClases = '';
	export let useSwap = false;
	export let swapOnText;
	export let swapOffText;
	export let swapOfftextLinethrough = swapOnText == swapOffText || !swapOffText;
	const dispatch = createEventDispatcher();
</script>

{#if useSwap}
	<label class="swap">
		<input
			type="checkbox"
			class=" {otherClases}"
			bind:this={swapEl}
			bind:checked={rawValue}
			on:change={() => {
				rawValue = swapEl.checked ? true : false;
				dispatch('changed', {
					chd_rawValue: rawValue
				});
			}}
		/>
		<div class="swap-on">{swapOnText}</div>
		<div class="swap-off {swapOfftextLinethrough ? 'line-through' : ''}">
			{swapOffText || swapOnText}
		</div>
	</label>
{:else}
	<label class="flex w-full ">
		<input
			type="checkbox"
			class="toggle {otherClases} toggle-primary"
			bind:this={toggleEl}
			bind:checked={rawValue}
			on:change={() => {
				rawValue = toggleEl.checked ? true : false;
				dispatch('changed', {
					chd_rawValue: rawValue
				});
			}}
		/>
		<p class="flex grow" />
		{#if showValue}
			<p class={rawValue ? 'text-primary' : ''}>{rawValue}</p>
		{/if}
	</label>
{/if}
