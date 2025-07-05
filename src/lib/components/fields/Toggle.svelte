<script>
	import { createEventDispatcher } from 'svelte';

	let toggleEl = $state();
	let swapEl = $state();
	/**
	 * @typedef {Object} Props
	 * @property {any} displayInterface
	 * @property {boolean} [rawValue]
	 * @property {boolean} [showValue]
	 * @property {string} [otherClases]
	 * @property {boolean} [useSwap]
	 * @property {any} swapOnText
	 * @property {any} swapOffText
	 * @property {any} [swapOfftextLinethrough]
	 */

	/** @type {Props} */
	let {
		displayInterface,
		rawValue = $bindable(true),
		showValue = true,
		otherClases = '',
		useSwap = false,
		swapOnText,
		swapOffText,
		swapOfftextLinethrough = swapOnText == swapOffText || !swapOffText
	} = $props();
	const dispatch = createEventDispatcher();
</script>

{#if useSwap}
	<label class="swap">
		<input
			type="checkbox"
			class=" {otherClases}"
			bind:this={swapEl}
			bind:checked={rawValue}
			onchange={() => {
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
			onchange={() => {
				rawValue = toggleEl.checked ? true : false;
				dispatch('changed', {
					chd_rawValue: rawValue
				});
			}}
		/>
		<p class="flex grow"></p>
		{#if showValue}
			<p class={rawValue ? 'text-primary' : ''}>{rawValue}</p>
		{/if}
	</label>
{/if}
