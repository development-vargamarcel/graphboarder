<script>
	import Modal from './Modal.svelte';
	import ExplorerTable from './ExplorerTable.svelte';

	export let showSelectModal;
	export let qmsData;
	export let selectedQMS;
	let rowSelectionState = {};
	let columns = [
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
						(arg) => `${arg.dd_displayName} (${arg.dd_kindList ? 'list of ' : ''}${arg.dd_kindEl})`
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
		}
	];
</script>

{#if showSelectModal}
	<!-- 
		on:apply={() => {
			showSelectModal = false;
		}} -->
	<Modal
		showApplyBtn={false}
		on:cancel={() => {
			showSelectModal = false;
		}}
	>
		<div class="flex flex-col ">
			<!-- <div class="w-full text-lg text-center  mb-2 ">
				<p class="badge badge-info font-bold">
					{groupDisplayTitle}
				</p>
			</div> -->

			<div>
				{#if qmsData.length > 1}
					<!-- content here -->
					<ExplorerTable
						enableMultiRowSelectionState={false}
						bind:rowSelectionState
						bind:data={qmsData}
						{columns}
						on:rowSelectionChange={(e) => {
							selectedQMS = e.detail.rows.map((row) => row.original)[0];
							console.log({ selectedQMS });
							// let columnNames = [];
							// let rowsData;
							// rowsData = e.detail.rows.map((row, i) => {
							// 	return row
							// 		.getVisibleCells()
							// 		.map((cell) => {
							// 			if (i == 0) {
							// 				columnNames.push(cell.column.id);
							// 			}
							// 			return cell.getValue();
							// 		})
							// 		.join(`,`);
							// });
							// csvData = `${columnNames.join(`,`)}\n${rowsData.join(`\n`)}`;
							showSelectModal = false;
						}}
					/>
				{/if}
			</div>
		</div>
	</Modal>
{/if}
