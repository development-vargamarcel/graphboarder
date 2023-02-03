<script>
	export let group;
	let showDescription;
</script>

{#if !group.group_isRoot}
	{group.group_name}
{/if}
<div class="text-xs ml-2 pt-1">
	{#if group.dd_kindList}
		( list )
	{/if}
	{#if group?.dd_relatedRoot?.dd_filterOperators}
		{`( ${group?.dd_relatedRoot?.dd_filterOperators?.join(',')} )`}
	{/if}
</div>

{#if group.group_name !== 'root'}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<i
		class="bi bi-info-circle text-secondary px-2"
		title={group.description}
		on:click={() => {
			if (showDescription == group.description) {
				showDescription = '';
			} else {
				showDescription = group.description;
			}
		}}
	/>
	{#if showDescription == group.description && group.description}
		<p class="text-xs font-light text-secondary select-none">
			({group.description})
		</p>
	{/if}
{/if}
