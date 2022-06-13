<script>
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { each } from 'svelte/internal';
	const flipDurationMs = 200;

	export let items = [];
	export let type = 'light';
	let itemsNew;
	let movedIndex;
	function handleSort(e) {
		console.log(e.detail.info.id);
		if (e.detail.info.trigger == 'droppedIntoAnother') {
			movedIndex = items.findIndex((item) => {
				return item.id == e.detail.info.id;
			});
			if (movedIndex !== -1) {
				items.splice(movedIndex, 1);
			}
		} else {
			itemsNew = e.detail.items;
			items = itemsNew;
		}

		console.log('itemsNew', itemsNew);
		console.log(e);
		console.log(items);
	}
</script>

<section
	class="bg-accent/50"
	use:dndzone={{ items, flipDurationMs, type }}
	on:consider={handleSort}
	on:finalize={handleSort}
>
	{#each items as item (item.id)}
		<div
			class=" {item.filterOperators ? 'bg-transparent border-primary' : 'bg-primary/50'}"
			animate:flip={{ duration: flipDurationMs }}
		>
			{#if item?.filterOperators}
				{#each item.filterOperators as filterOperator}
					{filterOperator.operator}
					<svelte:self items={filterOperator.items} type="light" />
				{/each}
			{/if}
			{item?.title ? item?.title : ''}
		</div>
	{/each}
</section>

<style>
	div {
		height: 1.5em;
		width: 10em;
		text-align: center;
		border: 1px solid black;
		margin: 0.2em;
		padding: 0.3em;
	}
	section {
		min-height: 12em;
	}
</style>
