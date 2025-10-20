<script>
	import EndpointsList from '$lib/components/EndpointsList.svelte';
	import QMSWraper from '$lib/components/QMSWraper.svelte';
	import { localEndpoints } from '$lib/stores/testData/testEndpoints';
	import { string_transformer } from '$lib/utils/dataStructureTransformers';
	import ExplorerTable from '$lib/components/ExplorerTable.svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import AddEndpointToLocalStorage from '$lib/components/addEndpointToLocalStorage.svelte';
	import { stringToJs } from '$lib/utils/usefulFunctions';
	import { getContext, onDestroy, onMount, setContext } from 'svelte';
	import { persisted } from 'svelte-persisted-store';
	import { getSortedAndOrderedEndpoints } from '$lib/utils/usefulFunctions';
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";

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

	let showAddEndpoint = $state(false);
	let endpointsToShow = $state('local');
	let selectedRows = $state([]);

	const HandleRowSelectionChange = (selectionModel) => {
		console.log(selectionModel);
		selectedRows = selectionModel.rows.map((row) => row.original);
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
			onRowClicked={(rowData) => {
				if (browser) {
					window.open(
						`${page.url.origin}/endpoints/localEndpoint--${rowData.id}`,
						'_blank'
					);
				}
			}}
			enableMultiRowSelectionState={false}
			data={getSortedAndOrderedEndpoints(localEndpoints, true)}
			{columns}
			onRowSelectionChange={() => {}}
		/>
	</div>
{/if}
{#if endpointsToShow == 'localstorage'}
	{#if showAddEndpoint}
		<AddEndpointToLocalStorage onHide={() => (showAddEndpoint = false)} />
	{/if}
	{#if selectedRows.length > 0}
		<div class="p-4">
			<Button variant="destructive" size="sm" onclick={deleteSelectedEndpoint}>
				Delete {selectedRows.length} selected {selectedRows.length === 1 ? 'row' : 'rows'}
			</Button>
		</div>
	{/if}
	<div class="mx-auto pl-4 pt-4 h-[50vh] ">
		{#key $localStorageEndpoints}
			<ExplorerTable
				onRowSelectionChange={HandleRowSelectionChange}
				onRowClicked={(rowData) => {
					if (browser) {
						window.open(
							`${page.url.origin}/endpoints/localstorageEndpoint--${rowData.id}`,
							'_blank'
						);
					}
				}}
				enableMultiRowSelectionState
				data={$localStorageEndpoints}
				{columns}
			/>
		{/key}
	</div>
{/if}
{#if endpointsToShow == 'remote'}
	<div class="w-full p-2">
		<Card.Root class="w-full">
			<Card.Header>
				<Card.Title>Add New Endpoint</Card.Title>
				<Card.Description>Configure endpoint in remote database</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<a
					href="/endpoints/localEndpoint--nhost/mutations/insert_endpoints_one"
					class="text-sm text-primary hover:underline block"
				>
					/endpoints/localEndpoint--nhost/mutations/insert_endpoints_one
				</a>
				<a
					href="/endpoints/localEndpoint--nhostRelay/mutations/insert_endpoints_one"
					class="text-sm text-primary hover:underline block"
				>
					/endpoints/localEndpoint--nhostRelay/mutations/insert_endpoints_one
				</a>
			</Card.Content>
		</Card.Root>
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

<div class="fixed bottom-1 right-1 flex gap-1">
	<Button
		size="sm"
		variant={endpointsToShow === 'local' ? 'default' : 'outline'}
		onclick={() => {
			endpointsToShow = 'local';
		}}
	>
		Local
		<Badge variant="secondary" class="ml-2">{getSortedAndOrderedEndpoints(localEndpoints, true).length}</Badge>
	</Button>
	<div class="flex gap-1">
		<Button
			size="sm"
			variant={endpointsToShow === 'localstorage' ? 'default' : 'outline'}
			onclick={() => {
				endpointsToShow = 'localstorage';
			}}
		>
			LocalStorage
			{#if $localStorageEndpoints?.length > 0}
				<Badge variant="secondary" class="ml-2">{$localStorageEndpoints.length}</Badge>
			{/if}
		</Button>
		<Button
			size="sm"
			variant="secondary"
			onclick={() => {
				endpointsToShow = 'localstorage';
				showAddEndpoint = true;
			}}
		>
			+
		</Button>
	</div>
	<Button
		size="sm"
		variant={endpointsToShow === 'remote' ? 'default' : 'outline'}
		onclick={() => {
			endpointsToShow = 'remote';
		}}
	>
		Remote
	</Button>
</div>
