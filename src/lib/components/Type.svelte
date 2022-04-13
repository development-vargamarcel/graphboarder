<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import Types from './Types.svelte';

	export let index;
	export let type;
	const rootTypeByName = (name) => {
		return $introspectionResult.rootTypes.filter((item) => {
			return item.name == name;
		})[0];
	};
	const queryFieldByName = (name) => {
		return $introspectionResult.queryFields.filter((item) => {
			return item.name == name;
		})[0];
	};
	const mutationFieldByName = (name) => {
		return $introspectionResult.mutationFields.filter((item) => {
			return item.name == name;
		})[0];
	};
	let showExpand = false;
	let expandData = {};
	const expand = () => {
		showExpand = true;
		expandData = rootTypeByName(type.name);
		console.log(expandData.fields);
	};
	let whatIsShown = `expanded ${type.name}`;
</script>

<li class="my-1 p-1 bg-base-300 rounded  space-x-2 py-2 normal-case text-xs">
	<div class="flex space-x-2">
		<div class="bg-secondary p-1 rounded">{index}</div>
		<div class="bg-secondary p-1 rounded">{type.kind}</div>
		<div
			class="btn btn-xs btn-info normal-case font-light"
			on:click={() => {
				console.log(type);
			}}
		>
			{type.name}
		</div>
		<div class="btn btn-xs  p-1 rounded" on:click={expand}>expand</div>
	</div>

	{#if showExpand}
		<Types whatToShow={expandData.fields} {whatIsShown} />
	{/if}
</li>
