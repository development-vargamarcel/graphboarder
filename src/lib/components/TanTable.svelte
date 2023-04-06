<script lang="ts">
	import { writable } from 'svelte/store';
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';
	import type { ColumnDef, TableOptions } from '@tanstack/table-core/src/types';
	import { formatData, getTableCellData } from '$lib/utils/usefulFunctions';
	import ColumnInfo from './ColumnInfo.svelte';
	import { createEventDispatcher } from 'svelte';
	export let idColName;
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
	let columns: ColumnDef<Person>[] = cols.map((col) => {
		return {
			...col,
			accessorFn: (row) => formatData(getTableCellData(row, col), 40, true),
			header: col.title,
			footer: col.title
		};
	});
	$: {
		columns = cols.map((col) => {
			return {
				accessorFn: (row) => formatData(getTableCellData(row, col), 40, true),
				header: col.title,
				footer: col.title
			};
		});
	}

	const options = writable<TableOptions<Person>>({
		data: data,
		columns: columns,
		getCoreRowModel: getCoreRowModel()
	});
	const rerender = () => {
		options.update((options) => ({
			...options,
			data: data
		}));
	};
	const table = createSvelteTable(options);
	const dispatch = createEventDispatcher();
</script>

<div class=" h-[80vh] overscroll-contain	 overflow-y-auto rounded-box pb-32 ">
	<table class="table table-compact w-full rounded-none">
		<thead class="sticky top-0 z-20">
			{#each $table.getHeaderGroups() as headerGroup}
				<tr class="sticky top-0 z-20 ">
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
			{#each $table.getRowModel().rows as row}
				<tr>
					<td>{parseInt(row.id) + 1}</td>
					{#each row.getVisibleCells() as cell}
						<td>
							<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
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
	<div class="h-4" />
	<button on:click={() => rerender()} class="border p-2"> Rerender </button>
</div>
