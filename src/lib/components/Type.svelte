<script>
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import Types from './Types.svelte';

	export let index;
	export let type;
	let name = type?.type?.ofType?.name || type?.type?.name || type?.name;
	let nameToDisplay = type?.name || type?.type?.name || type?.type?.ofType?.name;
	let kinds = [];

	if (type?.kind) {
		kinds.push(type?.kind);
	}
	if (type?.type?.kind) {
		kinds.push(type?.type?.kind);
	}
	if (type?.ofType?.kind) {
		kinds.push(type?.ofType?.kind);
	}
	if (type?.type?.ofType?.kind) {
		kinds.push(type?.type?.ofType?.kind);
	}
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
	let canExpand = false;
	if (!kinds.includes('SCALAR')) {
		canExpand = true;
	}
	const expand = () => {
		showExpand = true;
		expandData = rootTypeByName(name);
		console.log(expandData);
	};
</script>

<li class="my-1 p-1 bg-base-300 rounded  space-x-2 py-2 normal-case text-xs">
	<div class="flex space-x-2">
		<div class="flex space-x-2 w-1/3">
			<div class="bg-secondary p-1 rounded">{index}</div>
			<div class="bg-secondary p-1 rounded ">{kinds.join(' of ')}</div>
		</div>

		<div class="w-1/2">
			<div
				class="btn btn-xs btn-info normal-case font-light "
				on:click={() => {
					console.log(type);
				}}
			>
				{nameToDisplay}
			</div>
		</div>
		<div class="w-1/8">
			{#if canExpand}
				<div class="btn btn-xs  p-1 rounded" on:click={expand}>expand</div>
			{/if}
		</div>
	</div>

	{#if showExpand}
		<Types whatToShow={expandData.fields} whatIsShown="" />
	{/if}
</li>
