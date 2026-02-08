<script lang="ts">
	import { writable } from 'svelte/store';
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';
	import type { ColumnDef, TableOptions } from '@tanstack/table-core';
	import { formatData, getTableCellData } from '$lib/utils/usefulFunctions';
	import { getColumnVisibility, createTableOptions, getColumnFlags } from '$lib/utils/tableUtils';
	import ColumnInfo from './ColumnInfo.svelte';
	import { Logger } from '$lib/utils/logger';
	import { getContext, untrack } from 'svelte';

	let loadMore = false;

	const setRowSelection = (updater: any) => {
		if (updater instanceof Function) {
			rowSelectionState = updater(rowSelectionState);
		} else {
			rowSelectionState = updater;
		}
		options.update((old: any) => ({
			...old,
			state: {
				...old.state,
				rowSelection: rowSelectionState
			}
		}));

		Logger.debug($table.getSelectedRowModel());
		onRowSelectionChange?.({ ...$table.getSelectedRowModel(), rowSelectionState });
	};

	interface Props {
		prefix?: string;
		enableMultiRowSelectionState?: boolean;
		enableRowSelectionState?: boolean;
		infiniteHandler?: any;
		infiniteId?: any;
		data?: any[];
		columns?: any[];
		rowSelectionState?: any;
		idColName?: any;
		requiredColNames?: any;
		onRowSelectionChange?: (detail: any) => void;
		onHideColumn?: (detail: { column: string }) => void;
		onRowClicked?: (detail: any) => void;
	}

	let {
		prefix = '',
		enableMultiRowSelectionState = true,
		enableRowSelectionState = true,
		infiniteHandler = undefined,
		infiniteId = undefined,
		data = $bindable([]),
		columns = [],
		rowSelectionState = $bindable({}),
		idColName = undefined,
		requiredColNames = undefined,
		onRowSelectionChange,
		onHideColumn,
		onRowClicked
	}: Props = $props();

	let columnVisibility = $derived(getColumnVisibility(columns));

	const optionsObj = createTableOptions(
		data,
		untrack(() => columns),
		untrack(() => rowSelectionState),
		untrack(() => columnVisibility), // This might need to be reactive in createTableOptions logic or options update
		untrack(() => enableMultiRowSelectionState),
		untrack(() => enableRowSelectionState),
		getCoreRowModel,
		setRowSelection,
		untrack(() => idColName)
	);

	const options = writable(optionsObj);

	const rerender = () => {
		options.update((options: any) => ({
			...options,
			data: data
		}));
	};
	const table = createSvelteTable(options);

	$effect(() => {
		if (data) {
			Logger.debug({ data }, 'data changed');
			rerender();
		}
	});
	$effect(() => {
		Logger.debug({ table }, '$table', $table);
	});
</script>

<div
	class="w-full min-h-min h-min max-h-[70vh] max-w-full overscroll-contain overflow-auto rounded-box"
>
	<table class="table table-compact w-full rounded-none">
		<thead class="sticky top-0 z-20 bg-base-300">
			{#each $table.getHeaderGroups() as headerGroup}
				<tr class="sticky top-0 z-20">
					{#if enableRowSelectionState}
						<th>
							<label>
								<input
									type="checkbox"
									class="checkbox"
									onclick={() => {
										$table.toggleAllRowsSelected();
									}}
								/>
							</label>
						</th>
					{/if}
					<th>#</th>
					{#each headerGroup.headers as header}
						{@const columnHeader =
							typeof header.column.columnDef.header === 'string'
								? header.column.columnDef.header
								: header.column.id}
						{@const columnFlags = getColumnFlags(columnHeader, idColName, requiredColNames)}
						<th class="normal-case">
							<div class="dropdown dropdown-end">
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
								<label tabindex="0" class="cursor-pointer">
									<div class="flex space-x-2 hover:text-primary rounded-box">
										<div
											class="{columnFlags.isIdColumn
												? ' underline decoration-dotted font-black text-primary'
												: ''} {columnFlags.isRequired ? ' font-black text-primary' : ''} "
										>
											{#if !header.isPlaceholder}
												{@const SvelteComponent = flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
												<SvelteComponent />
											{/if}
										</div>
										<div class="bi bi-chevron-down"></div>
									</div>
								</label>
								<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
								<div
									tabindex="0"
									class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-max text-sm shadow-2xl"
								>
									<div
										class="flex flex-col overflow-x-auto text-sm font-normal normal-case w-full space-y-2"
									>
										<div class="w-full p-2 rounded-box flex flex-col space-y-2">
											<div
												class="w-full pr-2 hover:text-primary cursor-pointer max-w-xs md:max-w-sm overflow-x-auto"
											>
												<!-- {columnsData[index].stepsOfFields.join(' > ')} -->
											</div>
											<button
												class="w-full pr-2 hover:text-primary cursor-pointer text-left bg-transparent border-0 p-0"
												onclick={() => {
													onHideColumn?.({ column: columnHeader });
												}}
											>
												hide field
											</button>
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
			{#if $table.getRowModel().rows.length === 0}
				<tr>
					<td colspan={100}>
						<div class="flex flex-col items-center justify-center h-32 text-base-content/50">
							<div class="bi bi-inbox text-4xl mb-2"></div>
							<p>No data found</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each $table.getRowModel().rows as row, i (row.id)}
					<tr
						class="bg-base-100 hover:bg-base-300 cursor-pointer hover z-0"
						onclick={() => {
							onRowClicked?.(row.original);
							//goto(`${$page.url.origin}/queries/${$page.params.queryName}/${row.id}`);
						}}
					>
						{#if enableRowSelectionState}
							<th
								class="z-0"
								onclick={(e) => {
									e.stopPropagation();
								}}
							>
								<label>
									<input
										checked={row.getIsSelected()}
										name="rows"
										type={row.getCanMultiSelect() ? 'checkbox' : 'radio'}
										class={row.getCanMultiSelect() ? 'checkbox' : 'radio'}
										onchange={(e) => {
											const toggleSelectedHandler = row.getToggleSelectedHandler();
											toggleSelectedHandler(e);

											//Logger.debug($table.getSelectedRowModel());
										}}
									/>
								</label>
							</th>
						{/if}

						<td>{parseInt(row.index as any) + 1}</td>

						{#each row.getVisibleCells() as cell}
							<td class="break-no">
								{cell.renderValue()}
								<!-- <svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} /> -->
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>

	<div class="h-4"></div>
</div>
