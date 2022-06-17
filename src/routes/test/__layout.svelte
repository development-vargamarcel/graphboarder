<script>
	import Content from './../../lib/components/Content.svelte';

	let nodes = {
		mainContainer: {
			operator: '__or',

			name: 'mainContainer',
			items: [
				{
					id: 'container2'
				},
				{
					id: 'container3'
				},
				{
					id: 'container4'
				}
			],
			id: 'mainContainer'
		},
		container2: {
			operator: '__or',

			name: 'container 2',
			items: [
				{
					id: 'node5'
				},
				{
					id: 'node6'
				},
				{
					id: 'node7'
				},
				{
					id: 'node8'
				}
			],
			id: 'container2'
		},
		container3: {
			operator: '__and',

			name: 'container 3',
			items: [
				{
					id: 'node9'
				},
				{
					id: 'node10'
				},
				{
					id: 'node11'
				},
				{
					id: 'node12'
				}
			],
			id: 'container3'
		},
		container4: {
			operator: '__or',

			name: 'container 4',
			items: [
				{
					id: 'node13'
				},
				{
					id: 'node14'
				},
				{
					id: 'node15'
				},
				{
					id: 'node16'
				}
			],
			id: 'container4',
			color: 'salmon'
		},
		node5: {
			id: 'node5',
			name: 'item 5'
		},
		node6: {
			id: 'node6',
			name: 'item 6'
		},
		node7: {
			id: 'node7',
			name: 'item 7'
		},
		node8: {
			id: 'node8',
			name: 'item 8'
		},
		node9: {
			id: 'node9',
			name: 'item 9'
		},
		node10: {
			id: 'node10',
			name: 'item 10'
		},
		node11: {
			id: 'node11',
			name: 'item 11'
		},
		node12: {
			id: 'node12',
			name: 'item 12'
		},
		node13: {
			id: 'node13',
			name: 'item 13'
		},
		node14: {
			id: 'node14',
			name: 'item 14'
		},
		node15: {
			id: 'node15',
			name: 'item 15'
		},
		node16: {
			id: 'node16',
			name: 'item 16'
		}
	};
	console.log('aasas-nodes', nodes);
	const handle_changed = () => {
		let nodesClone = JSON.parse(JSON.stringify(nodes));
		let values = Object.values(nodesClone);
		let valuesWithItems = values.filter((node) => {
			return node?.items?.length > 0;
		});
		console.log('nodes', nodes);
		console.log({ values });
		console.log({ valuesWithItems });
	};
	const availableOperators = ['_and', '_or', '_nor'];
</script>

<div class="p-2">
	<Content node={nodes.mainContainer} bind:nodes on:changed={handle_changed} {availableOperators} />
</div>

<button
	class="btn btn-primary btn-sm"
	on:click={() => {
		let randomNr = Math.random();
		nodes[`${randomNr}`] = { id: randomNr, name: randomNr };
		nodes['mainContainer'].items.push({ id: randomNr });
	}}
>
	add item
</button>
<button
	class="btn btn-primary btn-sm"
	on:click={() => {
		let randomNr = Math.random();
		nodes[`${randomNr}`] = {
			id: randomNr,
			name: `container:${randomNr}`,
			operator: '_or',
			items: []
		};
		nodes['mainContainer'].items.push({ id: randomNr });
	}}
>
	add Container
</button>
