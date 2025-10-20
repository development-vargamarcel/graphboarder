<script lang="ts">
	import { Switch } from "$lib/components/ui/switch";

	interface Props {
		displayInterface?: any;
		rawValue?: boolean;
		showValue?: boolean;
		otherClases?: string;
		useSwap?: boolean;
		swapOnText?: any;
		swapOffText?: any;
		swapOfftextLinethrough?: any;
		onChanged?: (detail: any) => void;
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

	const handleChange = () => {
		onChanged?.({
			chd_rawValue: rawValue
		});
	};
</script>

{#if useSwap}
	<!-- Swap mode: show text that changes -->
	<label class="inline-flex items-center gap-2 cursor-pointer">
		<Switch
			bind:checked={rawValue}
			onchange={handleChange}
			class={otherClases}
		/>
		<span class="text-sm {rawValue ? '' : (swapOfftextLinethrough ? 'line-through text-muted-foreground' : '')}">
			{rawValue ? swapOnText : (swapOffText || swapOnText)}
		</span>
	</label>
{:else}
	<!-- Normal toggle mode -->
	<label class="flex w-full items-center gap-2">
		<Switch
			bind:checked={rawValue}
			onchange={handleChange}
			class={otherClases}
		/>
		<span class="flex grow"></span>
		{#if showValue}
			<p class="text-sm {rawValue ? 'text-primary font-medium' : 'text-muted-foreground'}">
				{rawValue}
			</p>
		{/if}
	</label>
{/if}
