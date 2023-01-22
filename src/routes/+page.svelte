<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { schemaData } from '$lib/stores/schemaData';
	//console.log($schemaData);
	import Type from '$lib/components/Type.svelte';
	import Page from '$lib/components/Page.svelte';

	let rootTypes = $schemaData.rootTypes;
	let queries = $schemaData.queryFields;
	let mutations = $schemaData.mutationFields;
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
		//console.log(rootTypes);
		whatToShow = rootTypes;
	};
	showRootTypes();
	const showQueries = () => {
		if (queries) {
			//console.log(queries);
			whatToShow = queries;
		} else {
			whatToShow = [];
		}
	};

	const showMutations = () => {
		if (mutations) {
			//console.log(mutations);
			whatToShow = mutations;
		} else {
			whatToShow = [];
		}
	};

	const rootTypeByName = (name) => {
		return $schemaData.rootTypes.filter((item) => {
			return item.name == name;
		})[0];
	};
	const queryFieldByName = (name) => {
		return $schemaData.queryFields.filter((item) => {
			return item.name == name;
		})[0];
	};
	const mutationFieldByName = (name) => {
		return $schemaData.mutationFields.filter((item) => {
			return item.name == name;
		})[0];
	};
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>
<Page MenuItem={true}>
	<section class="  h-screen pb-20 w-screen  overflow-auto ">
		<br />
		<br />
		<button
			class="btn btn-primary btn-sm"
			on:click={() => {
				//console.log(rootTypeByName('articles'));
			}}>rootTypes_by_name</button
		>
		<input type="text" class="input input-sm" bind:value={sortingInputValue} />
		<button class="btn bg-primary btn-sm" on:click={filterByWord}>filter</button>
		<br />
		<br />
		<button class="btn btn-xs" on:click={showRootTypes}>show all</button>
		<button class="btn btn-xs" on:click={showQueries}>show queries</button>
		<button class="btn btn-xs" on:click={showMutations}>show mutations</button>
		<div class="">
			{#key whatToShow}
				{#each whatToShow as type, index (index)}
					<Type
						{index}
						{type}
						template="default"
						depth={0}
						on:colAddRequest={(e) => {
							//console.log(e);
						}}
					/>
				{/each}
			{/key}
		</div>
	</section>
</Page>

<style>
</style>
