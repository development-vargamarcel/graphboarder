<script>
	export let stepsOfFieldsNew;
	let stepsOfFieldsNew_display = stepsOfFieldsNew
		.map((el) => {
			if (typeof el == 'string') {
				return el;
			} else {
				return '*';
			}
		})
		.join(' > ');
</script>

<div>
	{stepsOfFieldsNew_display}
</div>
