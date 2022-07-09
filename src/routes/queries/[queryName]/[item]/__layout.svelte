<script>
	import { getStores, navigating, page, session, updated } from '$app/stores';
	import { setClient, getClient, operationStore, query } from '@urql/svelte';
	import { introspectionResult } from '$lib/stores/introspectionResult';
	import client from '$lib/utils/urql_client';
	import Table from '$lib/components/Table.svelte';
	import { urqlClient } from '$lib/stores/urqlClient';
	import { urqlCoreClient } from '$lib/stores/urqlCoreClient';

	import {
		getQM_Field,
		getRootType,
		get_rootName,
		get_NamesArray,
		getFields_Grouped,
		getArguments_withInfo,
		get_KindsArray,
		buildQueryBody,
		generateQueryFragments,
		generateFragmentData,
		stepsOfFieldsToQueryFragment,
		get_displayName
	} from '$lib/utils/usefulFunctions';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Type from '$lib/components/Type.svelte';
	import Arg from '$lib/components/Arg.svelte';
	import ActiveArguments from '$lib/components/ActiveArguments.svelte';
	import { schemaData } from '$lib/stores/schemaData';
	setClient($urqlClient);
	let item = $page.params.item;
	console.log({ item });
</script>

<label for="my-drawer-4" class="drawer-overlay h-full" />
<div class="menu   bg-primary/0   text-base-content w-full ">
	<div class="flex h-full  ">
		<label for="my-drawer-4" class="sm:w-20 ">
			<div class="bg-primary/0" />
		</label>
		<div class="  bg-base-100 w-full ">
			<div class="flex space-x-2 sticky top-0 bg-base-100 shadow-md p-2">
				<div class="flex-none w-14 h-14 ...">
					<label for="my-drawer-4" class="drawer-button btn btn-primary w-min rounded-full">X</label
					>
				</div>
				<div class="grow h-14 ..." />
				<div class="flex-none w-14 h-14 ...">
					<div class="btn btn-success mb-40">ok</div>
				</div>
			</div>
			<div class="px-2 mt-4 pb-40">content here</div>
		</div>
	</div>
</div>
