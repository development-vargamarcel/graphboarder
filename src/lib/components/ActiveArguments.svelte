<script>
	export let activeArgumentsData;
</script>

<div>
	{#each activeArgumentsData as activeArgumentData}
		<p>{activeArgumentData.stepsOfFieldsNew}</p>
	{/each}
</div>
