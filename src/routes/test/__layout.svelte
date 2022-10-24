<!-- <script>
	import Map from '$lib/components/fields/Map.svelte';

	let containerEl;
</script>

<div class="testMap p-10" bind:this={containerEl}>
	<Map {containerEl} />
</div> -->
<script>
	import _ from 'lodash';
	let fragments = [
		{ businesses: { products: { product3: 'novaluehere' } } },
		{ businesses: { products: { product4: 'novaluehere' } } },
		{
			businesses: {
				products: {
					product4: { ingredients: { ingredient1: 'novaluehere', ingredient2: 'novaluehere' } }
				}
			}
		}
	];

	let merged = _.merge(...fragments);
	let stringified = JSON.stringify(merged);
	// let processed = stringified
	// 	.replaceAll(':"novaluehere"', '')
	// 	.replaceAll('"', '')
	// 	.replaceAll(':', '');
	let processed = stringified.replaceAll(/novaluehere|"|:/gi, '');
	console.log(merged);
	console.log(stringified);
	console.log(processed);
</script>
