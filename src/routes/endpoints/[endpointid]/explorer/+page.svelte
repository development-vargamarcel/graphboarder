<script lang="ts">
	import { run } from 'svelte/legacy';

	import EndpointinfoGeneratorAssistant from './../../../../lib/components/EndpointinfoGeneratorAssistant.svelte';
	import Type from '$lib/components/Type.svelte';
	import Page from '$lib/components/Page.svelte';
	import { sortingFunctionMutipleColumnsGivenArray } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import ExplorerTable from '$lib/components/ExplorerTable.svelte';
	import TypeList from '$lib/components/TypeList.svelte';

	const prefix = '';

	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData; //console.log($schemaData);

	let rootTypes = $schemaData.rootTypes;
	let queries = $schemaData.queryFields;
	let mutations = $schemaData.mutationFields;
	let whatToShow = $state([]);
	let whatToShowLastUsed = $state();
	let sortingInputValue = $state('');
	let sortingArray = $state([]);
	let caseSensitive = $state(false);
	run(() => {
		sortingArray = sortingInputValue.split(' ');
	});

	const filterByWord = () => {
		if (sortingArray.length == 1 && sortingArray[0] == '') {
			return;
		}

		const positiveWords = [];
		const negativeWords = [];
		sortingArray.forEach((word) => {
			if (word.startsWith('-') || word.startsWith('!')) {
				const processedWord = word.slice(1);
				negativeWords.push(processedWord);
			} else {
				let processedWord;
				if (word.startsWith('+')) {
					processedWord = word.slice(1);
				} else {
					processedWord = word;
				}
				positiveWords.push(processedWord);
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
					if (caseSensitive) {
						return type.dd_displayName.includes(word);
					}
					return type.dd_displayName.toLowerCase().includes(word.toLowerCase());
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
	let columns = $state([]);

	run(() => {
		if (whatToShow.length > 0) {
			columns = [
				{
					accessorFn: (row) => row.dd_displayName,
					header: 'dd_displayName',
					footer: 'dd_displayName',
					enableHiding: true
				},
				{
					accessorFn: (row) => row.dd_rootName,
					header: 'dd_rootName',
					footer: 'dd_rootName',
					enableHiding: true
				},
				{
					accessorFn: (row) => (row.dd_kindList_NON_NULL ? '!' : ''),
					header: 'L',
					footer: 'L',
					enableHiding: true
				},
				{
					accessorFn: (row) => (row.dd_kindList ? 'list' : ''),
					header: 'LL',
					footer: 'LL',
					enableHiding: true
				},
				{
					accessorFn: (row) => (row.dd_kindEl_NON_NULL ? '!' : ''),
					header: 'E',
					footer: 'E',
					enableHiding: true
				},
				{
					accessorFn: (row) => row.dd_kindEl,
					header: 'EE',
					footer: 'EE',
					enableHiding: true
				},

				{
					accessorFn: (row) =>
						row.args
							?.map(
								(arg) =>
									`${arg.dd_displayName} (${arg.dd_kindList ? 'list of ' : ''}${arg.dd_kindEl})`
							)
							.join('; '),
					header: 'Arguments',
					footer: 'Arguments',
					enableHiding: true
				},
				{
					accessorFn: (row) => row.description?.replaceAll(',', ';'),
					header: 'description',
					footer: 'description',
					enableHiding: true
				},
				{
					accessorFn: (row) => row?.tableBaseName,
					header: 'tableBaseName',
					footer: 'tableBaseName',
					enableHiding: true
				}
			];
		}
	});
	let showExplorer = $state(false);
	let showTable = $state(false);
	const toggleExplorer = () => {
		showExplorer = !showExplorer;
	};
	const toggleTable = () => {
		showTable = !showTable;
	};
	let csvData = $state();
	let selectedRowsOriginal = $state();
</script>

<Page MenuItem={true}>
	<section class="  h-screen pb-20 w-screen  overflow-auto ml-4">
		<div class="sticky top-0 bg-base-300">
			<div class="flex space-x-2 ">
				<button
					class="p-1 rounded-sm leading-none bg-accent text-xs max-w-min"
					onclick={() => {
						caseSensitive = !caseSensitive;
					}}>{caseSensitive ? 'case sensitive' : 'case insesitive'}</button
				>
				<input
					type="text"
					class="input input-xs mt-1"
					bind:value={sortingInputValue}
					onchange={filterByWord}
				/>

				<button
					class="mt-1 btn bg-primary btn-xs normal-case"
					onclick={() => {
						whatToShowLastUsed?.();
						filterByWord();
					}}>Filter</button
				>
				<code><b>+</b>include <b>-</b>exclude</code>
				<br />
			</div>
			<div>
				<button class="btn btn-xs " onclick={showRootTypes}> root</button>
				<button class="btn btn-xs" onclick={showQueries}> queries</button>
				<button class="btn btn-xs" onclick={showMutations}> mutations</button>
				<button class="btn btn-xs" onclick={showQueriesAndMutations}> Q&M</button>
				<button class="btn btn-xs" onclick={showAll}> all</button>
			</div>
			<div>
				<button class="btn btn-xs btn-accent" onclick={toggleExplorer}>toggle explorer</button>
				<button class="btn btn-xs btn-accent" onclick={toggleTable}>toggle table</button>
				<button
					class="btn btn-xs btn-primary"
					onclick={() => {
						navigator.clipboard.writeText(csvData);
					}}>copy csv</button
				>
				<button
					class="btn btn-xs btn-primary"
					onclick={() => {
						console.log(selectedRowsOriginal);
						if (selectedRowsOriginal.length == 0) {
							return alert('no rows selected');
						}
						if (selectedRowsOriginal.length == 1) {
							const row = selectedRowsOriginal[0];
							row.tableBaseName = prompt('tableBaseName', row.tableBaseName);
						} else {
							const tableBaseName = prompt('tableBaseName', 'tableName');
							selectedRowsOriginal.forEach((row) => {
								row.tableBaseName = tableBaseName;
							});
						}

						whatToShow = whatToShow;
					}}>edit</button
				>
				<button
					class="btn btn-xs btn-primary"
					onclick={() => {
						whatToShow = whatToShow;
						showTable = false;
						setTimeout(() => {
							showTable = true;
						}, 200);
						//columns = columns;
					}}>rerender table</button
				>
			</div>
		</div>

		<br />

		{#if showTable && whatToShow.length > 0}
			<!-- content here -->
			<ExplorerTable
				bind:data={whatToShow}
				{columns}
				onRowSelectionChange={(detail) => {
					selectedRowsOriginal = detail.rows.map((row) => row.original);
					let columnNames = [];
					let rowsData;
					rowsData = detail.rows.map((row, i) => {
						return row
							.getVisibleCells()
							.map((cell) => {
								if (i == 0) {
									columnNames.push(cell.column.id);
								}
								return cell.getValue();
							})
							.join(`,`);
					});
					csvData = `${columnNames.join(`,`)}\n${rowsData.join(`\n`)}`;
				}}
			/>
		{/if}
		{#if showExplorer}
			<div class="">
				{#key whatToShow}
					{#each whatToShow as type, index (index)}
						<Type
							{index}
							{type}
							template="default"
							depth={0}
						/>
					{/each}
				{/key}
			</div>{/if}
	</section>
</Page>

<style>
</style>
