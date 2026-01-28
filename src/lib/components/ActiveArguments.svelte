<script lang="ts">
	/**
	 * Component for managing active arguments (filters, sorting, etc.) for a QMS operation.
	 * Displays groups of arguments and allows adding/removing/modifying them.
	 */
	import { getContext, setContext, untrack } from 'svelte';
	import ActiveArgumentsGroupWraper from '$lib/components/ActiveArgumentsGroupWraper.svelte';
	import { Logger } from '$lib/utils/logger';
    import type { QMSMainWraperContext, QMSWraperContext } from '$lib/types/index';

	interface Props {
		isControlPanelChild?: any;
		stepsOfFieldsThisAppliesTo?: any;
		prefix?: string;
		QMSarguments?: any;
		activeArgumentsDataGrouped_Store?: any;
		QMS_info?: any;
		onUpdateQuery?: () => void;
	}

	let {
		isControlPanelChild = undefined,
		stepsOfFieldsThisAppliesTo = undefined,
		prefix = '',
		QMSarguments = undefined,
		activeArgumentsDataGrouped_Store = $bindable(),
		QMS_info = $bindable(),
		onUpdateQuery
	}: Props = $props();

	const activeArgumentsContext = {
		stepsOfFieldsThisAppliesTo: untrack(() => stepsOfFieldsThisAppliesTo),
		isControlPanelChild: untrack(() => isControlPanelChild)
	};
	setContext(`${untrack(() => prefix)}activeArgumentsContext`, activeArgumentsContext);
	let mainWraperCtx = getContext<QMSMainWraperContext>(`${untrack(() => prefix)}QMSMainWraperContext`);
	const endpointInfo = mainWraperCtx?.endpointInfo;
	const schemaData = mainWraperCtx?.schemaData;
	let qmsWraperCtx = getContext<QMSWraperContext>(`${untrack(() => prefix)}QMSWraperContext`);

	// Set defaults if not provided
	if (!activeArgumentsDataGrouped_Store) {
		activeArgumentsDataGrouped_Store = qmsWraperCtx?.activeArgumentsDataGrouped_Store;
	}
	if (!QMS_info) {
		QMS_info = qmsWraperCtx?.QMS_info;
	}

	let activeArgumentsDataGrouped = [];

	$effect(() => {
		Logger.debug('$activeArgumentsDataGrouped_Store', $activeArgumentsDataGrouped_Store);
	});
	const update_activeArgumentsDataGrouped = (groupNewData: any) => {
		Logger.debug({ groupNewData });
		activeArgumentsDataGrouped_Store.update_groups(groupNewData);
	};

	$effect(() => {
		if ($activeArgumentsDataGrouped_Store && $activeArgumentsDataGrouped_Store.length == 0) {
			activeArgumentsDataGrouped_Store.set_groups(QMS_info, schemaData, QMSarguments, endpointInfo);
		}
	});

	Logger.debug({ QMS_info });
	let showDescription = null;
</script>

{#if $activeArgumentsDataGrouped_Store && $activeArgumentsDataGrouped_Store.length == 0}
	<div class="p-2">
		<div class="alert alert-info shadow-lg">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="stroke-current flex-shrink-0 w-6 h-6"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span>No arguments available.</span>
			</div>
		</div>
	</div>
{/if}

<div class="">
	{#if $activeArgumentsDataGrouped_Store && $activeArgumentsDataGrouped_Store.length > 0}
		<div class="flex justify-end p-2">
			<button
				class="btn btn-sm btn-outline btn-error gap-2"
				onclick={() => {
					activeArgumentsDataGrouped_Store.set_groups(QMS_info, schemaData, null, endpointInfo);
					onUpdateQuery?.();
				}}
			>
				<i class="bi bi-x-circle"></i>
				Clear All Filters
			</button>
		</div>
	{/if}
	{#if $activeArgumentsDataGrouped_Store}
		{#each $activeArgumentsDataGrouped_Store as group}
			<ActiveArgumentsGroupWraper
				{onUpdateQuery}
				{update_activeArgumentsDataGrouped}
				{group}
				argsInfo={QMS_info?.args}
				{activeArgumentsDataGrouped}
			/>
		{/each}
	{/if}
</div>
