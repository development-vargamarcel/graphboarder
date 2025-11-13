<script lang="ts">
	let toggleEl = $state();
	let swapEl = $state();
	interface Props {
		displayInterface: any;
		rawValue?: boolean;
		showValue?: boolean;
		otherClases?: string;
		useSwap?: boolean;
		swapOnText: any;
		swapOffText: any;
		swapOfftextLinethrough?: any;
		onChanged?: (detail: { chd_rawValue: boolean }) => void;
	}

	let {
		displayInterface,
		rawValue = $bindable(true),
		showValue = true,
		otherClases = '',
		useSwap = false,
		swapOnText,
		swapOffText,
		swapOfftextLinethrough = swapOnText == swapOffText || !swapOffText,
		onChanged
	}: Props = $props();
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
				onChanged?.({
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
				onChanged?.({
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
