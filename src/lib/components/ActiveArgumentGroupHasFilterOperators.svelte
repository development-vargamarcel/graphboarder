<script>
	import { flip } from 'svelte/animate';
	import { dndzone, SHADOW_PLACEHOLDER_ITEM_ID } from 'svelte-dnd-action';
	import { createEventDispatcher } from 'svelte';
	import ActiveArgument from './ActiveArgument.svelte';
	const dispatch = createEventDispatcher();
	export let nodes;
	export let node;
	export let availableOperators;
	export let group;
	const flipDurationMs = 300;
	function handleDndConsider(e) {
		node.items = e.detail.items;
	}
	function handleDndFinalize(e) {
		node.items = e.detail.items;
		console.log(e);
		nodes = { ...nodes };
		dispatch('changed');
	}
</script>

<b
	style="color:{node.color}"
	on:click={() => {
		if (node?.operator) {
			if (node?.operator == '_or') {
				node.operator = '_and';
			} else {
				node.operator = '_or';
			}
		} else if (node?.not !== undefined) {
			node.not = !node.not;
		} else {
			node.not = !node.not;
		}

		dispatch('changed');
	}}
>
	{node?.operator ? `${node?.operator}` : ''}
</b>
<br />
{#if node?.operator}
	<!-- container -->
{:else}
	<div
		class="transition-color duration-500 rounded-box border-l-2 {node.not
			? ' border-error'
			: 'border-transparent'} "
	>
		<ActiveArgument
			on:contextmenu={() => {
				if (node?.not !== undefined) {
					node.not = !node.not;
				}
			}}
			on:inUseChanged={() => {}}
			on:delete_activeArgument={() => {}}
			activeArgumentData={node}
			{group}
		/>
	</div>
	<!-- 
		{generate_final_gqlArgObj}
		{delete_activeArgument}
		{activeArgumentsDataGrouped}
		{activeArgumentsData} -->
{/if}

{#if node.hasOwnProperty('items')}
	<section
		class=" bg-base-100/50 rounded-l-none {node?.items?.length == 0 ? 'pt-10' : ''} {node?.isMain
			? 'pb-10 border-l-2 border-l-primary'
			: ''}"
		use:dndzone={{ items: node.items, flipDurationMs }}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		<!-- WE FILTER THE SHADOW PLACEHOLDER THAT WAS ADDED IN VERSION 0.7.4, filtering this way rather than checking whether 'nodes' have the id became possible in version 0.9.1 -->
		{#each node.items.filter((item) => item.id !== SHADOW_PLACEHOLDER_ITEM_ID) as item (item.id)}
			<div
				animate:flip={{ duration: flipDurationMs }}
				class="item bg-base-100/50 pl-4 py-2 border-l-2 border-primary/50"
			>
				<svelte:self bind:nodes node={nodes[item.id]} on:changed {availableOperators} {group} />
			</div>
		{/each}
	</section>
{/if}

<style>
</style>
