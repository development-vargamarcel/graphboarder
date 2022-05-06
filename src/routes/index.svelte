<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { introspectionResult } from '$lib/stores/introspectionResult';
	console.log($introspectionResult);
	import Type from '$lib/components/Type.svelte';

	let rootTypes = $introspectionResult.rootTypes;
	let queries = $introspectionResult.queryFields;
	let mutations = $introspectionResult.mutationFields;
	let whatToShow = [];
	let sortingInputValue = '';
	let sortingArray = [];
	$: sortingArray = sortingInputValue.split(' ');

	const filterByWord = () => {
		rootTypes = rootTypes.filter((type) => {
			if (sortingArray.length == 1 && sortingArray[0] == '') {
				return true;
			} else {
				return sortingArray.includes(type.kind);
			}
		});

		showRootTypes();
	};
	const showRootTypes = () => {
		console.log(rootTypes);
		whatToShow = rootTypes;
	};
	showRootTypes();
	const showQueries = () => {
		if (queries) {
			console.log(queries);
			whatToShow = queries;
		} else {
			whatToShow = [];
		}
	};

	const showMutations = () => {
		if (mutations) {
			console.log(mutations);
			whatToShow = mutations;
		} else {
			whatToShow = [];
		}
	};

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
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section class=" min-w-max w-full ">
	<br />
	<br />
	<button
		class="btn btn-primary btn-sm"
		on:click={() => {
			console.log(rootTypeByName('articles'));
		}}>rootTypes_by_name</button
	>
	<input type="text" class="input input-sm" bind:value={sortingInputValue} />
	<button class="btn bg-primary btn-sm" on:click={filterByWord}>filter</button>
	<br />
	<br />
	<button class="btn" on:click={showRootTypes}>show all</button>
	<button class="btn" on:click={showQueries}>show queries</button>
	<button class="btn" on:click={showMutations}>show mutations</button>
	<div class="">
		{#key whatToShow}
			{#each whatToShow as type, index (index)}
				<Type
					{index}
					{type}
					template="default"
					stepsOfFields={[]}
					depth={0}
					on:colAddRequest={(e) => {
						console.log(e);
					}}
				/>
			{/each}
		{/key}
	</div>
</section>

<style>
</style>
