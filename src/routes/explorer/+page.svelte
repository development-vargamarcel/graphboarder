<script lang="ts">
	import { schemaData } from '$lib/stores/endpointHandling/schemaData';
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
	const sortingFunctionMutipleColumnsGivenArray = (array) => {
		let maxIndex = array.length - 1;
		const check = (currentIndex) => {
			const column = array[currentIndex];
			if (column[0] < column[1]) {
				return -1;
			}
			if (column[0] > column[1]) {
				return 1;
			}
			if (currentIndex + 1 <= maxIndex) {
				return check(currentIndex + 1);
			}
			return 0;
		};
		return check(0);
	};
	const filterByWord = () => {
		whatToShow = whatToShow.filter((type) => {
			if (sortingArray.length == 1 && sortingArray[0] == '') {
				return true;
			} else {
				return sortingArray.find((word) => {
					return type.dd_displayName.includes(word);
				});
			}
		});
	};
	const showRootTypes = () => {
		//console.log(rootTypes);
		whatToShow = rootTypes;
	};
	showRootTypes();
	const showQueries = () => {
		if (queries) {
			//console.log(queries);
			whatToShow = queries?.sort((a, b) => {
				let ga = a.dd_displayName;
				let gb = b.dd_displayName;
				return sortingFunctionMutipleColumnsGivenArray([[ga, gb]]);
			});
		} else {
			whatToShow = [];
		}
	};

	const showMutations = () => {
		if (mutations) {
			whatToShow = mutations?.sort((a, b) => {
				let fa = a.dd_displayName.substring(6);
				let fb = b.dd_displayName.substring(6);
				let ga = a.dd_displayName;
				let gb = b.dd_displayName;
				return sortingFunctionMutipleColumnsGivenArray([
					[fa, fb],
					[ga, gb]
				]);
			});
		} else {
			whatToShow = [];
		}
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

<Page MenuItem={true}>
	<section class="  h-screen pb-20 w-screen  overflow-auto ml-2">
		<br />
		<br />

		<input type="text" class="input input-xs" bind:value={sortingInputValue} />
		<button class="btn bg-primary btn-xs" on:click={filterByWord}>filter</button>
		<br />
		<br />
		<button class="btn btn-xs " on:click={showRootTypes}>show all</button>
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
