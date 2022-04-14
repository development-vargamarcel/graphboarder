<script>
	import { goto } from '$app/navigation';
	import { mandatoryArguments } from '$lib/utils/usefulFunctions';
	export let origin;
	export let query;
	//let queryName = query?.type?.ofType?.name || query?.type?.name || query?.name;
	let queryName = query.name;
	let queryNameDisplay = queryName;
	let mandatoryArgs = mandatoryArguments(query);
	if (mandatoryArgs) {
		queryNameDisplay = `${queryNameDisplay} !(${mandatoryArgs.length})`;
	}
</script>

<a
	href="{origin}/queries/{queryName}"
	on:mousedown={() => {
		goto(`${origin}/queries/`);
	}}
	on:click={() => {
		goto(`${origin}/queries/${queryName}`, { replaceState: true });
	}}>{queryNameDisplay}</a
>
