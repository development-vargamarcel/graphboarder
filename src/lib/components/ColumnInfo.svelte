<script lang="ts">
	let { stepsOfFields } = $props();
	let stepsOfFields_display = stepsOfFields
		.map((el) => {
			if (typeof el == 'string') {
				return el;
			} else {
				return '*';
			}
		})
		.join(' > ');
</script>

<div class="select-all">
	{stepsOfFields_display}
</div>
