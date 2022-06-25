<script>
	import Content from './../../lib/components/Content.svelte';

	let nodes = {
		mainContainer: {
			operator: '_or',
			isMain: true,
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
			operator: '_or',
			isMain: false,

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
			operator: '_and',
			isMain: false,

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
			operator: '_or',
			isMain: false,

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
			not: false
		},
		node6: {
			id: 'node6',
			not: false
		},
		node7: {
			id: 'node7',
			not: false
		},
		node8: {
			id: 'node8',
			not: false
		},
		node9: {
			id: 'node9',
			not: false
		},
		node10: {
			id: 'node10',
			not: false
		},
		node11: {
			id: 'node11',
			not: false
		},
		node12: {
			id: 'node12',
			not: false
		},
		node13: {
			id: 'node13',
			not: false
		},
		node14: {
			id: 'node14',
			not: false
		},
		node15: {
			id: 'node15',
			not: false
		},
		node16: {
			id: 'node16',
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

<div class="p-2  h-80 overflow-auto">
	<div>
		<Content
			node={nodes.mainContainer}
			bind:nodes
			on:changed={handle_changed}
			{availableOperators}
		/>
	</div>
</div>

<button
	class="btn btn-primary btn-sm"
	on:click={() => {
		let randomNr = Math.random();
		nodes[`${randomNr}`] = { id: randomNr, not: false };
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
			operator: '_or',
			isMain: false,

			items: []
		};
		nodes['mainContainer'].items.push({ id: randomNr });
	}}
>
	add Container
</button>
