<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	// import { introspectionResult } from '$lib/stores/introspectionResult';
	// console.log($introspectionResult);
	// import Types from '$lib/components/Types.svelte';

	// let rootTypes = $introspectionResult.rootTypes;
	// let queries = $introspectionResult.queryFields;
	// let mutations = $introspectionResult.mutationFields;
	// let whatIsShown = '-';
	// let whatToShow = [];
	// let sortingInputValue = '';
	// let sortingArray = [];
	// $: sortingArray = sortingInputValue.split(' ');

	// const filterByWord = () => {
	// 	rootTypes = rootTypes.filter((type) => {
	// 		if (sortingArray.length == 1 && sortingArray[0] == '') {
	// 			return true;
	// 		} else {
	// 			return sortingArray.includes(type.kind);
	// 		}
	// 	});

	// 	showRootTypes();
	// };
	// const showRootTypes = () => {
	// 	console.log(rootTypes);
	// 	whatToShow = rootTypes;
	// 	whatIsShown = 'rootTypes';
	// };
	// showRootTypes();
	// const showQueries = () => {
	// 	console.log(queries);
	// 	whatToShow = queries;
	// 	whatIsShown = 'queryFields';
	// };

	// const showMutations = () => {
	// 	console.log(mutations);
	// 	whatToShow = mutations;
	// 	whatIsShown = 'mutationFields';
	// };

	// console.log($introspectionResult);
	// const rootTypeByName = (name) => {
	// 	return $introspectionResult.rootTypes.filter((item) => {
	// 		return item.name == name;
	// 	})[0];
	// };
	// const queryFieldByName = (name) => {
	// 	return $introspectionResult.queryFields.filter((item) => {
	// 		return item.name == name;
	// 	})[0];
	// };
	// const mutationFieldByName = (name) => {
	// 	return $introspectionResult.mutationFields.filter((item) => {
	// 		return item.name == name;
	// 	})[0];
	// };
</script>

<!-- 
<svelte:head>
	<title>Home</title>
</svelte:head>

<section class="">
	<button
		class="btn btn-primary"
		on:click={() => {
			console.log(rootTypeByName('articles'));
		}}>rootTypes_by_name</button
	>
	<br />

	<button class="btn" on:click={showRootTypes}>show all</button>
	<button class="btn" on:click={showQueries}>show queries</button>
	<button class="btn" on:click={showMutations}>show mutations</button>

	<br />
	<input type="text" class="input input-sm" bind:value={sortingInputValue} />
	<button class="btn bg-primary" on:click={filterByWord}>filter</button>
	<br />
	<br />

	<Types {whatToShow} {whatIsShown} />
</section> -->
<style>
</style>
