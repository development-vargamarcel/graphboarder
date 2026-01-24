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

	const HandleRowSelectionChange = (detail) => {
		console.log(detail);
		selectedRows = detail.rows.map((row) => row.original);
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

<div class="p-4">
    <div role="tablist" class="tabs tabs-lifted mb-4">
        <button
            role="tab"
            class="tab {endpointsToShow === 'local' ? 'tab-active' : ''}"
            aria-selected={endpointsToShow === 'local'}
            onclick={() => endpointsToShow = 'local'}
        >Local</button>
        <button
            role="tab"
            class="tab {endpointsToShow === 'localstorage' ? 'tab-active' : ''}"
            aria-selected={endpointsToShow === 'localstorage'}
            onclick={() => endpointsToShow = 'localstorage'}
        >Local Storage</button>
        <button
            role="tab"
            class="tab {endpointsToShow === 'remote' ? 'tab-active' : ''}"
            aria-selected={endpointsToShow === 'remote'}
            onclick={() => endpointsToShow = 'remote'}
        >Remote</button>
    </div>

    {#if endpointsToShow == 'local'}
        <div class="mx-auto h-[50vh] border-base-300 bg-base-100 rounded-box p-2 md:p-6">
            <ExplorerTable
                onRowClicked={(detail) => {
                    if (browser) {
                        window.open(
                            `${page.url.origin}/endpoints/localEndpoint--${detail.id}`,
                            '_blank'
                        );
                    }
                }}
                enableMultiRowSelectionState={false}
                data={getSortedAndOrderedEndpoints(localEndpoints, true)}
                {columns}
                onRowSelectionChange={(detail) => {}}
            />
        </div>
    {/if}

    {#if endpointsToShow == 'localstorage'}
        <div class="border-base-300 bg-base-100 rounded-box p-2 md:p-6">
            <div class="flex justify-between items-center mb-4">
                 <div class="flex space-x-2">
                    <button class="btn btn-primary btn-sm" onclick={() => showAddEndpoint = true}>
                        Add Endpoint
                    </button>
                    {#if selectedRows.length > 0}
                        <button class="btn btn-sm btn-warning" onclick={deleteSelectedEndpoint}>
                            Delete Selected ({selectedRows.length})
                        </button>
                    {/if}
                 </div>
            </div>

            {#if showAddEndpoint}
                <AddEndpointToLocalStorage onHide={() => (showAddEndpoint = false)} />
            {/if}

            <div class="mx-auto pt-4 h-[50vh]">
                {#key $localStorageEndpoints}
                    <ExplorerTable
                        onRowSelectionChange={HandleRowSelectionChange}
                        onRowClicked={(detail) => {
                            if (browser) {
                                window.open(
                                    `${page.url.origin}/endpoints/localstorageEndpoint--${detail.id}`,
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
        </div>
    {/if}

    {#if endpointsToShow == 'remote'}
        <div class="border-base-300 bg-base-100 rounded-box p-2 md:p-6">
            <div class="w-full mb-4">
                <div class="card w-full glass">
                    <div class="card-body">
                        <h2 class="card-title">Add new Endpoint</h2>
                        <p>To remote db</p>
                        <div class="flex flex-col space-y-2">
                            <a class="btn btn-outline btn-sm justify-start" href="/endpoints/localEndpoint--nhost/mutations/insert_endpoints_one">
                                /endpoints/localEndpoint--nhost/mutations/insert_endpoints_one
                            </a>
                            <a class="btn btn-outline btn-sm justify-start" href="/endpoints/localEndpoint--nhostRelay/mutations/insert_endpoints_one">
                                /endpoints/localEndpoint--nhostRelay/mutations/insert_endpoints_one
                            </a>
                        </div>
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
        </div>
    {/if}
</div>
