<script>
	export let tableColsData;
	export let fields;

	let layoutData = tableColsData.map((colData) => {
		return colData.queryFragment;
	});
	console.log('layoutData', layoutData);
</script>
