<script>
	import Modal from './Modal.svelte';
	import ExplorerTable from './ExplorerTable.svelte';
	import { getContext } from 'svelte';
	export let prefix = '';
	export let node;
	const nodeContext_forDynamicData = getContext(`${prefix}nodeContext_forDynamicData`);
	//let selectedQMS = nodeContext_forDynamicData.selectedQMS;
	let QMSRows = nodeContext_forDynamicData.QMSRows;
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
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	let getManyData;
	$: if ($QMSFieldToQMSGetMany_Store.length > 0) {
		getManyData = QMSFieldToQMSGetMany_Store.getObj({
			nodeOrField: node
		})?.getMany;
	}
	let selectedQMS;
	let rowSelectionState;
	$: if (getManyData) {
		selectedQMS = getManyData.selectedQMS;
		rowSelectionState = getManyData.rowSelectionState;
	}
	export let showSelectQMSModal;
</script>

{#if showSelectQMSModal}
	<!-- 
		on:apply={() => {
			showSelectQMSModal = false;
		}} -->
	<Modal
		showApplyBtn={false}
		on:cancel={() => {
			showSelectQMSModal = false;
		}}
	>
		<div class="flex flex-col ">
			<!-- <div class="w-full text-lg text-center  mb-2 ">
				<p class="badge badge-info font-bold">
					{groupDisplayTitle}
				</p>
			</div> -->

			<div>
				<!-- {#if QMSRows?.length > 1} -->
				<!-- content here -->
				<ExplorerTable
					enableMultiRowSelectionState={false}
					bind:rowSelectionState
					bind:data={$QMSRows}
					{columns}
					on:rowSelectionChange={(e) => {
						////
						const objToAdd = {
							nodeOrField: node,
							getMany: {
								selectedQMS: e.detail.rows.map((row) => row.original)[0],
								rowSelectionState: e.detail.rowSelectionState
							},
							id: Math.random().toString(36).substr(2, 9)
						};
						console.log({ objToAdd });
						QMSFieldToQMSGetMany_Store.addOrReplaceKeepingOldId(objToAdd);
						////
						//	$selectedQMS = e.detail.rows.map((row) => row.original)[0];

						showSelectQMSModal = false;
					}}
				/>
				<!-- {/if} -->
			</div>
		</div>
	</Modal>
{/if}
