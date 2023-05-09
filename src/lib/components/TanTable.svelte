<script lang="ts">
	import { writable } from 'svelte/store';
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';
	import type { ColumnDef, TableOptions } from '@tanstack/table-core/src/types';
	import { formatData, getTableCellData } from '$lib/utils/usefulFunctions';
	import ColumnInfo from './ColumnInfo.svelte';
	import { createEventDispatcher, getContext } from 'svelte';
	import InfiniteLoading from 'svelte-infinite-loading';
	const dispatch = createEventDispatcher();
	export let prefix = '';

	let loadMore = false;

	export let enableMultiRowSelectionState = true;
	export let enableRowSelectionState = true;
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	let QMSWraperContext = getContext(`${prefix}QMSWraperContext`);

	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	const QMS_info = QMSWraperContext?.QMS_info;
	let idColName = QMSWraperContext?.idColName;
	const { paginationOptions } = getContext(`${prefix}QMSWraperContext`);

	export let infiniteHandler;
	export let infiniteId;
	type Person = {
		firstName: string;
		lastName: string;
		age: number;
		visits: number;
		status: string;
		progress: number;
	};
	export let data;
	export let cols = [];
	const getColumnVisibility = (cols) => {
		let columnVisibility = {};
		cols.forEach((col) => {
			col.hidden ? (columnVisibility[col.title] = false) : (columnVisibility[col.title] = true);
		});
		return columnVisibility;
	};
	let columnVisibility = getColumnVisibility(cols);
	console.log({ columnVisibility });
	const getColumns = (cols) => {
		let columns: ColumnDef<Person>[] = cols.map((col) => {
			return {
				...col,
				accessorFn: (row) => formatData(getTableCellData(row, col), 40, true),
				header: col.title,
				footer: col.title,
				enableHiding: true
			};
		});
		return columns;
	};
	let columns: ColumnDef<Person>[] = getColumns(cols);
	$: {
		columns = getColumns(cols);
	}
	export let rowSelectionState = {};
	const setRowSelection = (updater) => {
		if (updater instanceof Function) {
			rowSelectionState = updater(rowSelectionState);
		} else {
			rowSelectionState = updater;
		}
		options.update((old) => ({
			...old,
			state: {
				...old.state,
				rowSelection: rowSelectionState
			}
		}));

		console.log($table.getSelectedRowModel());
		dispatch('rowSelectionChange', { ...$table.getSelectedRowModel() });
	};

	console.log({ rowSelectionState });
	const options = writable<TableOptions<Person>>({
		data: data,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		enableMultiRowSelection: enableMultiRowSelectionState,
		enableRowSelection: enableRowSelectionState,
		onRowSelectionChange: setRowSelection,
		enableHiding: true,
		initialState: { rowSelection: rowSelectionState },
		state: { columnVisibility, rowSelection: rowSelectionState },
		getRowId: (row) => row?.[idColName]
	});
	const rerender = () => {
		options.update((options) => ({
			...options,
			data: data
		}));
	};
	const table = createSvelteTable(options);

	$: {
		columns = getColumns(cols);

		options.update((options) => ({
			...options,
			data: data,
			columns: columns
		}));
		console.log({ data, cols });
	}
	$: console.log({ table }, '$table', $table);
</script>

<div class=" h-[80vh] overscroll-contain	 overflow-y-auto rounded-box pb-32 ">
	<table class="table table-compact w-full rounded-none">
		<thead class="sticky top-0 z-20">
			{#each $table.getHeaderGroups() as headerGroup}
				<tr class="sticky top-0 z-20 ">
					{#if enableRowSelectionState}
						<th>
							<label>
								<input type="checkbox" class="checkbox" />
							</label>
						</th>
					{/if}
					<th>#</th>
					{#each headerGroup.headers as header}
						<th class="normal-case ">
							<div class="dropdown dropdown-end  ">
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
								<label tabindex="0" class="cursor-pointer ">
									<div class="flex space-x-2 hover:text-primary rounded-box ">
										<div
											class={idColName == header.column.columnDef.header
												? ' underline decoration-dotted'
												: ''}
										>
											{#if !header.isPlaceholder}
												<svelte:component
													this={flexRender(header.column.columnDef.header, header.getContext())}
												/>
											{/if}
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
												<ColumnInfo stepsOfFields={header.column.columnDef.stepsOfFields} />
												<!-- {colsData[index].stepsOfFields.join(' > ')} -->
											</div>
											<!-- svelte-ignore a11y-click-events-have-key-events -->
											<div
												class="w-full pr-2 hover:text-primary cursor-pointer "
												on:click={() => {
													dispatch('hideColumn', { column: header.column.columnDef.header });
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
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each $table.getRowModel().rows as row, i (row.id)}
				<tr
					class="bg-base-100 hover:bg-base-300 cursor-pointer hover z-0"
					on:click={() => {
						dispatch('rowClicked', row.original);
						//goto(`${$page.url.origin}/queries/${$page.params.queryName}/${row.id}`);
					}}
				>
					{#if enableRowSelectionState}
						<th class="z-0" on:click|stopPropagation={() => {}}>
							<label>
								<input
									checked={row.getIsSelected()}
									name="rows"
									type={row.getCanMultiSelect() ? 'checkbox' : 'radio'}
									class={row.getCanMultiSelect() ? 'checkbox' : 'radio'}
									on:change={(e) => {
										const toggleSelectedHandler = row.getToggleSelectedHandler();
										toggleSelectedHandler(e);

										//console.log($table.getSelectedRowModel());
									}}
								/>
							</label>
						</th>
					{/if}

					<td>{parseInt(row.index) + 1}</td>

					{#each row.getVisibleCells() as cell}
						<td>
							{cell.renderValue()}
							<!-- <svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} /> -->
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
		<!-- <tfoot>
			{#each $table.getFooterGroups() as footerGroup}
				<tr>
					{#each footerGroup.headers as header}
						<th>
							{#if !header.isPlaceholder}
								<svelte:component
									this={flexRender(header.column.columnDef.footer, header.getContext())}
								/>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</tfoot> -->
	</table>
	{#if $paginationOptions?.infiniteScroll && !loadMore && data?.length > 0}
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
	{#if $paginationOptions?.infiniteScroll && data?.length > 0 && loadMore}
		<InfiniteLoading on:infinite={infiniteHandler} identifier={infiniteId} distance={100} />
	{/if}
	<div class="h-4" />
</div>
