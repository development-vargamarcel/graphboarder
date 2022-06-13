<script>
	import List from './../../lib/components/List.svelte';

	let items1 = [
		{ id: 1, title: 'I' },
		{ id: 2, title: 'Am' },
		{ id: 3, title: 'Yoda' },
		{
			id: 5654,
			filterOperators: [
				{
					operator: '_and',
					items: [
						{ id: 12, title: 'fdsf' },
						{ id: 13, title: 'fdsfds' },
						{ id: 14, title: 'fdsdf' }
					]
				}
			]
		}
	];
</script>

<h3>You can't mix the light side and the dark side</h3>
<hr />
<List items={items1} type="light" />
