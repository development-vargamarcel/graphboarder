<script lang="ts">
	export const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData; //console.log($schemaData);
	import Type from '$lib/components/Type.svelte';
	import Page from '$lib/components/Page.svelte';
	import { sortingFunctionMutipleColumnsGivenArray } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';

	let rootTypes = $schemaData.rootTypes;
	let queries = $schemaData.queryFields;
	let mutations = $schemaData.mutationFields;
	let whatToShow = [];
	let whatToShowLastUsed;
	let sortingInputValue = '';
	let sortingArray = [];
	let caseSensitive = false;
	$: sortingArray = sortingInputValue.split(' ');

	const filterByWord = () => {
		if (sortingArray.length == 1 && sortingArray[0] == '') {
			return;
		}

		const positiveWords = [];
		const negativeWords = [];
		sortingArray.forEach((word) => {
			if (word.startsWith('-')) {
				negativeWords.push(word);
			} else {
				positiveWords.push(word);
			}
		});

		whatToShow = whatToShow.filter((type) => {
			return (
				positiveWords.find((word) => {
					if (caseSensitive) {
						return type.dd_displayName.includes(word);
					}
					return type.dd_displayName.toLowerCase().includes(word.toLowerCase());
				}) &&
				!negativeWords.find((word) => {
					const processedWord = word.slice(1);
					if (caseSensitive) {
						return type.dd_displayName.includes(processedWord);
					}
					return type.dd_displayName.toLowerCase().includes(processedWord.toLowerCase());
				})
			);
		});
	};
	const showRootTypes = () => {
		//console.log(rootTypes);
		whatToShow = rootTypes?.sort((a, b) => {
			let ea = a.dd_rootName;
			let eb = b.dd_rootName;
			// let ga = a.dd_displayName;
			// let gb = b.dd_displayName;
			return sortingFunctionMutipleColumnsGivenArray([
				[ea, eb]
				// [ga, gb]
			]);
		});
		whatToShowLastUsed = showRootTypes;
		filterByWord();
	};

	const showQueries = () => {
		if (queries) {
			//console.log(queries);
			whatToShow = queries?.sort((a, b) => {
				let ea = a.dd_rootName;
				let eb = b.dd_rootName;
				let ga = a.dd_displayName;
				let gb = b.dd_displayName;
				return sortingFunctionMutipleColumnsGivenArray([
					[ea, eb],
					[ga, gb]
				]);
			});
		} else {
			whatToShow = [];
		}
		whatToShowLastUsed = showQueries;
		filterByWord();
	};

	const showMutations = () => {
		if (mutations) {
			whatToShow = mutations?.sort((a, b) => {
				let ea = a.dd_rootName;
				let eb = b.dd_rootName;
				let fa = a.dd_displayName.substring(6);
				let fb = b.dd_displayName.substring(6);
				let ga = a.dd_displayName;
				let gb = b.dd_displayName;
				return sortingFunctionMutipleColumnsGivenArray([
					[ea, eb],
					[fa, fb],
					[ga, gb]
				]);
			});
		} else {
			whatToShow = [];
		}
		whatToShowLastUsed = showMutations;
		filterByWord();
	};

	const showAll = () => {
		if (mutations) {
			whatToShow = [...rootTypes, ...queries, ...mutations]?.sort((a, b) => {
				let ea = a.dd_rootName;
				let eb = b.dd_rootName;
				let fa = a.dd_displayName.substring(6);
				let fb = b.dd_displayName.substring(6);
				let ga = a.dd_displayName;
				let gb = b.dd_displayName;
				return sortingFunctionMutipleColumnsGivenArray([
					[ea, eb],
					[fa, fb],
					[ga, gb]
				]);
			});
		} else {
			whatToShow = [];
		}
		whatToShowLastUsed = showAll;
		filterByWord();
	};
	const showQueriesAndMutations = () => {
		if (mutations) {
			whatToShow = [...queries, ...mutations]?.sort((a, b) => {
				let ea = a.dd_rootName;
				let eb = b.dd_rootName;
				let fa = a.dd_displayName.substring(6);
				let fb = b.dd_displayName.substring(6);
				let ga = a.dd_displayName;
				let gb = b.dd_displayName;
				return sortingFunctionMutipleColumnsGivenArray([
					[ea, eb],
					[fa, fb],
					[ga, gb]
				]);
			});
		} else {
			whatToShow = [];
		}
		whatToShowLastUsed = showQueriesAndMutations;
		filterByWord();
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
	<section class="  h-screen pb-20 w-screen  overflow-auto ml-4">
		<br />
		<br />
		<div class="flex space-x-2">
			<button
				class="p-1 rounded-sm leading-none bg-base-100 text-xs max-w-min"
				on:click={() => {
					caseSensitive = !caseSensitive;
				}}>{caseSensitive ? 'case sensitive' : 'case insesitive'}</button
			>
			<input
				type="text"
				class="input input-xs mt-1"
				bind:value={sortingInputValue}
				on:change={filterByWord}
			/>

			<button
				class="mt-1 btn bg-primary btn-xs normal-case"
				on:click={() => {
					whatToShowLastUsed?.();
					filterByWord();
				}}>Filter</button
			>
			<code>include <b>-</b>exclude</code>
		</div>

		<br />
		<br />
		<button class="btn btn-xs " on:click={showRootTypes}> root</button>
		<button class="btn btn-xs" on:click={showQueries}> queries</button>
		<button class="btn btn-xs" on:click={showMutations}> mutations</button>
		<button class="btn btn-xs" on:click={showQueriesAndMutations}> Q&M</button>

		<button class="btn btn-xs" on:click={showAll}> all</button>

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
