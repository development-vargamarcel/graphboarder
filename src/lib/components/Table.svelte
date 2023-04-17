<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	export let prefix = '';
	import {
		formatData,
		getDataGivenStepsOfFields,
		getTableCellData
	} from '$lib/utils/usefulFunctions';
	import InfiniteLoading from 'svelte-infinite-loading';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import ColumnInfo from '$lib/components/ColumnInfo.svelte';
	import TanTable from './TanTable.svelte';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	let QMSWraperContext = getContext(`${prefix}QMSWraperContext`);

	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	const QMS_info = QMSWraperContext?.QMS_info;
	let idColName = endpointInfo.get_idField(QMS_info, schemaData)?.dd_displayName;
	export let colsData = [];
	export let showCheckBox = false;
	let visibleColsData = [];
	let visibleColumns = [];
	$: {
		visibleColsData = colsData.filter((colData) => {
			return !colData?.hidden;
		});
		visibleColumns = visibleColsData.map((colData) => {
			return colData.title;
		});
	}

	export let rows = [];
	export let infiniteHandler;
	export let infiniteId;
	const dispatch = createEventDispatcher();
	const { paginationOptions } = getContext(`${prefix}QMSWraperContext`);
	let loadMore = false;
</script>

<div class=" h-[80vh] overscroll-contain	 overflow-y-auto rounded-box pb-32 ">
	<table class="table table-compact w-full rounded-none  ">
		<thead class="sticky top-0 z-20">
			<tr class="sticky top-0 z-20 ">
				<th>
					<label>
						<input type="checkbox" class="checkbox" />
					</label>
				</th>
				<!-- <th>edit</th> -->
				<th>#</th>
				{#each visibleColumns as column, index}
					<th class="normal-case ">
						<div class="dropdown dropdown-end  ">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
							<label tabindex="0" class="cursor-pointer ">
								<div class="flex space-x-2 hover:text-primary rounded-box ">
									<div class={idColName == column ? ' underline decoration-dotted' : ''}>
										{column}
									</div>
									<div class="bi bi-chevron-down " />
								</div>
							</label>
							<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
							<div
								tabindex="0"
								class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-max text-sm shadow-2xl"
							>
								<div
									class="flex flex-col overflow-x-auto text-sm font-normal normal-case w-full space-y-2"
								>
									<div class="w-full   p-2 rounded-box flex flex-col space-y-2">
										<div
											class="w-full pr-2 hover:text-primary cursor-pointer max-w-xs  md:max-w-sm overflow-x-auto"
										>
											<ColumnInfo stepsOfFields={visibleColsData[index].stepsOfFields} />
											<!-- {colsData[index].stepsOfFields.join(' > ')} -->
										</div>
										<!-- svelte-ignore a11y-click-events-have-key-events -->
										<div
											class="w-full pr-2 hover:text-primary cursor-pointer "
											on:click={() => {
												dispatch('hideColumn', { column: column, index: index });
											}}
										>
											hide field
										</div>
									</div>
								</div>
							</div>
						</div>
					</th>
				{/each}
				<th class="sticky right-0 z-0 w-2" />
			</tr>
		</thead>
		<tbody class="z-0">
			{#each rows as row, index}
				<tr
					class="bg-base-100 hover:bg-base-300 cursor-pointer hover z-0"
					on:click={() => {
						dispatch('rowClicked', row);
						//goto(`${$page.url.origin}/queries/${$page.params.queryName}/${row.id}`);
					}}
				>
					<th class="z-0" on:click|stopPropagation={() => {}}>
						<label>
							<input type="checkbox" class="checkbox" />
						</label>
					</th>

					<th class="z-0">{index + 1}</th>
					{#each visibleColsData as colData, index}
						<td class="z-0">
							{formatData(getTableCellData(row, colData, index), 40, true)}
						</td>{/each}
					<td class="sticky right-0 z-0 w-2" />
				</tr>
			{/each}
		</tbody>
	</table>
	{#if $paginationOptions?.infiniteScroll && !loadMore && rows?.length > 0}
		<!-- content here -->
		<button
			class="btn btn-primary w-full mt-4 "
			on:click={() => {
				loadMore = true;
			}}
		>
			Load more
		</button>
	{/if}
	{#if $paginationOptions?.infiniteScroll && rows?.length > 0 && loadMore}
		<InfiniteLoading on:infinite={infiniteHandler} identifier={infiniteId} distance={100} />
	{/if}
	<slot name="itemDisplay" />
</div>

{#if rows.length > 0}
	<TanTable bind:data={rows} bind:cols={colsData} {idColName} on:hideColumn {infiniteHandler} />
{/if}
