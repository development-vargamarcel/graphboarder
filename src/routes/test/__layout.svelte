<script>
	import Content from './../../lib/components/Content.svelte';

	let nodes = {
		mainContainer: {
			operator: '__or',
			isMain: true,
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
			isMain: false,

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
			isMain: false,

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
			isMain: false,

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
			name: 'item 5',
			not: false
		},
		node6: {
			id: 'node6',
			name: 'item 6',
			not: false
		},
		node7: {
			id: 'node7',
			name: 'item 7',
			not: false
		},
		node8: {
			id: 'node8',
			name: 'item 8',
			not: false
		},
		node9: {
			id: 'node9',
			name: 'item 9',
			not: false
		},
		node10: {
			id: 'node10',
			name: 'item 10',
			not: false
		},
		node11: {
			id: 'node11',
			name: 'item 11',
			not: false
		},
		node12: {
			id: 'node12',
			name: 'item 12',
			not: false
		},
		node13: {
			id: 'node13',
			name: 'item 13',
			not: false
		},
		node14: {
			id: 'node14',
			name: 'item 14',
			not: false
		},
		node15: {
			id: 'node15',
			name: 'item 15',
			not: false
		},
		node16: {
			id: 'node16',
			name: 'item 16',
			not: false
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
		nodes[`${randomNr}`] = { id: randomNr, name: randomNr, not: false };
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
			operator: '__or',
			isMain: false,

			items: []
		};
		nodes['mainContainer'].items.push({ id: randomNr });
	}}
>
	add Container
</button>
