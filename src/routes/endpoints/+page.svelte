<script>
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import { localEndpoints } from '$lib/stores/testData/testEndpoints';
	import { string_transformer } from '$lib/utils/dataStructureTransformers';
	import ExplorerTable from '$lib/components/ExplorerTable.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import AddEndpointToLocalStorage from '$lib/components/addEndpointToLocalStorage.svelte';
	import { stringToJs } from '$lib/utils/usefulFunctions';
	import { getContext, onDestroy, onMount, setContext } from 'svelte';
	import { persisted } from 'svelte-persisted-store';
	import { getSortedAndOrderedEndpoints } from '$lib/utils/usefulFunctions';

	const localStorageEndpoints = getContext('localStorageEndpoints');
	let showExplorerTable = true;
	let columns = [
		{
			accessorFn: (row) => row.id,
			header: 'id',
			footer: 'id',
			enableHiding: true
		},
		{
			accessorFn: (row) => row.description,
			header: 'description',
			footer: 'description',
			enableHiding: true
		},
		{
			accessorFn: (row) => row.url,
			header: 'url',
			footer: 'url',
			enableHiding: true
		}
	];

	let showAddEndpoint = false;
	let endpointsToShow = 'local';
	let selectedRows = [];

	const HandleRowSelectionChange = (e) => {
		console.log(e);
		selectedRows = e.detail.rows.map((row) => row.original);
	};
	const deleteSelectedEndpoint = () => {
		localStorageEndpoints.set(
			$localStorageEndpoints.filter((endpoint) => {
				return !selectedRows.some((row) => {
					return row.id == endpoint.id;
				});
			})
		);
		selectedRows = [];
	};
</script>

{#if endpointsToShow == 'local'}
	<div class="mx-auto pl-4 pt-4 h-[50vh] ">
		<ExplorerTable
			on:rowClicked={(e) => {
				if (browser) {
					window.open(
						`${$page.url.origin}/endpoints/localEndpoint--${e.detail.id}`,
						'_blank' // <- This is what makes it open in a new window.
					);
					//	window.location = `${$page.url.origin}/endpoints/${e.detail.id}`;
				}
				//goto(`${$page.url.origin}/endpoints/${e.detail.id}`);
			}}
			enableMultiRowSelectionState={false}
			data={getSortedAndOrderedEndpoints(localEndpoints, true)}
			{columns}
			on:rowSelectionChange={(e) => {}}
		/>
	</div>
{/if}
{#if endpointsToShow == 'localstorage'}
	{#if showAddEndpoint}
		<AddEndpointToLocalStorage on:hide={() => (showAddEndpoint = false)} />
	{/if}
	{#if selectedRows.length > 0}
		<button class="btn btn-sm btn-warning" on:click={deleteSelectedEndpoint}
			>delete selected rows</button
		>
	{/if}
	<div class="mx-auto pl-4 pt-4 h-[50vh] ">
		{#key $localStorageEndpoints}
			<ExplorerTable
				on:rowSelectionChange={HandleRowSelectionChange}
				on:rowClicked={(e) => {
					if (browser) {
						window.open(
							`${$page.url.origin}/endpoints/localstorageEndpoint--${e.detail.id}`,
							'_blank' // <- This is what makes it open in a new window.
						);
						//	window.location = `${$page.url.origin}/endpoints/${e.detail.id}`;
					}
					//goto(`${$page.url.origin}/endpoints/${e.detail.id}`);
				}}
				enableMultiRowSelectionState
				data={$localStorageEndpoints}
				{columns}
				on:rowSelectionChange={(e) => {}}
			/>
		{/key}
	</div>
{/if}
{#if endpointsToShow == 'remote'}
	<div class="w-full p-2">
		<div class="card w-full glass">
			<div class="card-body">
				<h2 class="card-title">Add new Endpoint</h2>
				<p>To remote db</p>
				<a href="/endpoints/localEndpoint--nhost/mutations/insert_endpoints_one"
					>/endpoints/localEndpoint--nhost/mutations/insert_endpoints_one</a
				>

				<a href="/endpoints/localEndpoint--nhostRelay/mutations/insert_endpoints_one"
					>/endpoints/localEndpoint--nhostRelay/mutations/insert_endpoints_one</a
				>
			</div>
		</div>
	</div>

	<QMSWraper
		isOutermostQMSWraper={true}
		QMSName="endpoints"
		tableColsData_StoreInitialValue={[
			{ title: 'provider name', stepsOfFields: ['endpoints', 'configuration', 'id'] },
			{ title: 'provider id', stepsOfFields: ['endpoints', 'configuration', 'id'] },
			{ title: 'configuration', stepsOfFields: ['endpoints', 'configuration', 'configuration'] }
		]}
	>
		<div class="pt-2">
			<EndpointsList QMSName="endpoints" />
		</div>
	</QMSWraper>
{/if}

<div class="fixed bottom-1 right-1 flex space-x-2">
	<button
		class="btn btn-xs"
		on:click={() => {
			endpointsToShow = 'local';
		}}
	>
		local
	</button>
	<div class="flex">
		<button
			class="btn btn-xs"
			on:click={() => {
				endpointsToShow = 'localstorage';
			}}
		>
			localstorage
		</button>
		<button
			class="btn btn-xs"
			on:click={() => {
				endpointsToShow = 'localstorage';
				showAddEndpoint = true;
			}}
		>
			+
		</button>
	</div>
	<button
		class="btn btn-xs"
		on:click={() => {
			endpointsToShow = 'remote';
		}}
	>
		remote
	</button>
</div>
