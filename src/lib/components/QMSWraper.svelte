<!--
	@component
	QMSWraper (Query/Mutation/Subscription Wrapper) establishes the context for a specific GraphQL operation.
	It handles argument state, pagination, column selection, and query generation.
-->
<script lang="ts">
	import { Create_paginationOptions } from '$lib/stores/pagination/paginationOptions';
	import { Create_activeArgumentsDataGrouped_Store } from '$lib/stores/QMSHandling/activeArgumentsDataGrouped_Store';
	import { Create_finalGqlArgObj_Store } from '$lib/stores/QMSHandling/finalGqlArgObj_Store';
	import { Create_tableColsData_Store } from '$lib/stores/QMSHandling/tableColsData_Store';
	import { Create_QMS_bodyPart_StoreDerived } from '$lib/stores/QMSHandling/QMS_bodyPart_StoreDerived';
	import { getContext, setContext, onDestroy, untrack } from 'svelte';
	import { Create_QMS_bodyPartsUnifier_StoreDerived } from '$lib/stores/QMSHandling/QMS_bodyPartsUnifier_StoreDerived';
	import { Create_paginationState } from '$lib/stores/QMSHandling/paginationState';
	import { Create_paginationState_derived } from '$lib/stores/QMSHandling/paginationState_derived';
	import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';
	import {
		get_scalarColsData,
		get_nodeFieldsQMS_info,
		getDeepField
	} from '$lib/utils/usefulFunctions';
	import {
		findReturningColumnsLocation,
		buildPrefixStepsOfFields,
		getIdColumnName,
		getPaginationTypeInfo,
		mergeColumnData
	} from '$lib/utils/qmsContextUtils';
	import type {
		QMSType as QMSTypeType,
		FieldWithDerivedData,
		ActiveArgumentGroup,
		TableColumnData,
		SchemaData,
		SchemaDataStore,
		EndpointInfoStore,
		PaginationTypeInfo,
		QMSMainWraperContext as QMSMainWraperContextType,
		QMSWraperContext as QMSWraperContextType
	} from '$lib/types/index';
	import { get, writable } from 'svelte/store';
	import { Create_mergedChildren_finalGqlArgObj_Store } from '$lib/stores/QMSHandling/mergedChildren_finalGqlArgObj_Store';
	import { Create_mergedChildren_QMSWraperCtxData_Store } from '$lib/stores/QMSHandling/mergedChildren_QMSWraperCtxData_Store';
	import { Create_mergedChildren_controlPanel_Store } from '$lib/stores/QMSHandling/mergedChildren_controlPanel_Store';
	import QMSWraperCtxDataCurrentComputations from './QMSWraperCtxDataCurrentComputations.svelte';
	import { Create_QMSFieldToQMSGetMany_Store } from '$lib/stores/QMSFieldToQMSGetMany_Store';
	import JSON5 from 'json5';
	import { Logger } from '$lib/utils/logger';

	/**
	 * Props for QMSWraper.
	 */
	interface Props {
		/**
		 * A prefix string to namespace the context.
		 */
		prefix?: string;
		/**
		 * Extra information to store in the context.
		 */
		extraInfo?: Record<string, unknown>;
		/**
		 * Initial arguments for the GraphQL query.
		 */
		initialGqlArgObj?: Record<string, unknown>;
		/**
		 * Whether this wrapper is the outermost one. Defaults to true if no parent QMSWraperContext is found.
		 */
		isOutermostQMSWraper?: boolean;
		/**
		 * The type of operation: 'query', 'mutation', or 'subscription'.
		 */
		QMSType?: QMSTypeType;
		/**
		 * The name of the root field for the operation (e.g. 'users', 'insert_users').
		 */
		QMSName?: string;
		/**
		 * The schema information for the field. If not provided, it will be looked up using QMSName and QMSType.
		 */
		QMS_info?: FieldWithDerivedData | undefined;
		/**
		 * The context object created by this wrapper. Can be bound to to access internal state from parent.
		 */
		QMSWraperContext?: Record<string, unknown>;
		/**
		 * Initial value for the active arguments store.
		 */
		activeArgumentsDataGrouped_StoreInitialValue?: ActiveArgumentGroup[] | undefined;
		/**
		 * A store for active arguments. If provided, it will be used instead of creating a new one.
		 */
		activeArgumentsDataGrouped_Store?: any;
		/**
		 * Initial columns for the table.
		 */
		tableColsData_StoreInitialValue?: TableColumnData[];
		/**
		 * A store for the final GraphQL argument object.
		 */
		finalGqlArgObj_Store?: any;
		/**
		 * A context object provided from outside.
		 */
		QMSWraperContextGiven?: any;
		/**
		 * Whether to prefer the given context over creating a new one.
		 */
		preferGivenQMSWraperContext?: boolean;
		/**
		 * The content to render inside the wrapper.
		 */
		children?: import('svelte').Snippet;
	}

	let {
		prefix = '',
		extraInfo = {},
		initialGqlArgObj = {},
		isOutermostQMSWraper = undefined, // Calculated below
		QMSType = 'query',
		QMSName = `${Math.random()}`,
		QMS_info = $bindable(undefined),
		QMSWraperContext = $bindable({}),
		activeArgumentsDataGrouped_StoreInitialValue,
		activeArgumentsDataGrouped_Store = undefined, // Calculated below
		tableColsData_StoreInitialValue = $bindable([]),
		finalGqlArgObj_Store = undefined, // Calculated below
		QMSWraperContextGiven,
		preferGivenQMSWraperContext = true,
		children
	}: Props = $props();

	// Use derived for context to ensure we get the latest if context somehow changes (unlikely for prefix)
	let QMSMainWraperContext = $derived(
		getContext<QMSMainWraperContextType>(`${prefix}QMSMainWraperContext`)
	);

	// Calculate defaults that depend on other props/context
	let calculated_isOutermostQMSWraper = $derived.by(() => {
		if (isOutermostQMSWraper !== undefined) return isOutermostQMSWraper;
		return getContext<QMSWraperContextType>(`${prefix}QMSWraperContext`) ? false : true;
	});

	let mergedChildren_QMSWraperCtxData_Store = $state<any>();

	// We set the context object reference immediately. We will mutate it.
	// Using untrack to suppress warning about prefix, as context keys are expected to be stable.
	setContext(`${untrack(() => prefix)}QMSWraperContext`, QMSWraperContext);

	// Derived value for children context setting
	// Note: setContext is synchronous and should not be in $effect usually, but if this is intended to be reactive...
	// Actually setContext MUST be called during component initialization.
	// The previous code had it in $effect which might be wrong or ignored by Svelte 5 for context provision?
	// "setContext... must be called during component initialization".
	// If calculated_isOutermostQMSWraper is derived, we can't condition setContext on it easily if it changes.
	// Assuming isOutermostQMSWraper doesn't change after init, we can untrack it.
	if (untrack(() => calculated_isOutermostQMSWraper)) {
		setContext(`${untrack(() => prefix)}OutermostQMSWraperContext`, QMSWraperContext);
	}

	// Main Logic Effect
	$effect(() => {
		const endpointInfo: EndpointInfoStore = QMSMainWraperContext?.endpointInfo;
		const schemaData: SchemaDataStore = QMSMainWraperContext?.schemaData;

		if (preferGivenQMSWraperContext && QMSWraperContextGiven) {
			Object.assign(QMSWraperContext, QMSWraperContextGiven);
			return;
		}

		// QMS_info resolution
		if (!QMS_info && schemaData) {
			QMS_info = schemaData.get_QMS_Field(QMSName, QMSType, schemaData);
		}

		if (!QMS_info) {
			Logger.warn(
				`QMS_info not found for ${QMSName} ${QMSType}. Check if schema is loaded and the name is correct.`
			);
			return;
		}

		Logger.info('QMSWraper initialized', { QMSType, QMSName });

		let current_activeArgumentsDataGrouped_Store = activeArgumentsDataGrouped_Store;
		if (!current_activeArgumentsDataGrouped_Store) {
			current_activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store(
				activeArgumentsDataGrouped_StoreInitialValue
			);
		}

		const dd_paginationType: string | undefined = QMS_info?.dd_paginationType;
		const paginationTypes = get_paginationTypes(endpointInfo, schemaData);
		let paginationTypeInfo = getPaginationTypeInfo(dd_paginationType, paginationTypes);
		Logger.debug('QMS Info loaded', { QMSType, QMSName, QMS_info });

		const paginationOptions = Create_paginationOptions();
		const paginationState = Create_paginationState(
			undefined,
			QMS_info.dd_paginationArgs,
			QMS_info.dd_paginationType,
			endpointInfo,
			schemaData
		);
		Logger.debug('Pagination State created', { QMSName, paginationState: get(paginationState) });

		const paginationState_derived = Create_paginationState_derived(
			paginationState,
			QMS_info.dd_paginationArgs,
			QMS_info.dd_paginationType,
			endpointInfo,
			schemaData
		);

		let current_finalGqlArgObj_Store = finalGqlArgObj_Store;
		if (!current_finalGqlArgObj_Store) {
			current_finalGqlArgObj_Store = Create_finalGqlArgObj_Store(
				current_activeArgumentsDataGrouped_Store,
				paginationState
			);
		}

		const rowsLocation = endpointInfo.get_rowsLocation(QMS_info, schemaData);
		const nodeFieldsQMS_info = get_nodeFieldsQMS_info(QMS_info, rowsLocation, schemaData);
		Logger.debug('Node Fields Info', { nodeFieldsQMS_info });

		const possibleLocations =
			QMSType == 'query'
				? (get(endpointInfo) as any).returningColumnsPossibleLocationsInQueriesPerRow
				: (get(endpointInfo) as any).returningColumnsPossibleLocationsInMutations;

		const returningColumnsResult = findReturningColumnsLocation(
			nodeFieldsQMS_info,
			possibleLocations,
			schemaData,
			'fields'
		);

		const returningColumnsLocationQMS_Info = returningColumnsResult?.info;
		const returningColumnsLocation = returningColumnsResult?.location || [];

		Logger.debug('Returning Columns Location', {
			returningColumnsLocationQMS_Info,
			returningColumnsLocation,
			QMSType
		});

		let prefixStepsOfFields = buildPrefixStepsOfFields(
			QMSType,
			QMS_info.dd_displayName,
			rowsLocation,
			returningColumnsLocation
		);

		let scalarColsData = get_scalarColsData(
			returningColumnsLocationQMS_Info,
			prefixStepsOfFields,
			schemaData
		);

		const dependencyColsData =
			paginationTypeInfo?.get_dependencyColsData(QMSName, 'query', schemaData) || [];

		const current_tableColsData_StoreInitialValue = mergeColumnData(
			scalarColsData,
			tableColsData_StoreInitialValue,
			dependencyColsData
		);
		Logger.debug('Table Columns Data merged', { QMSName, current_tableColsData_StoreInitialValue });

		const tableColsData_Store = Create_tableColsData_Store(
			paginationState,
			current_tableColsData_StoreInitialValue
		);

		const mergedChildren_finalGqlArgObj_Store = Create_mergedChildren_finalGqlArgObj_Store({});
		mergedChildren_QMSWraperCtxData_Store = Create_mergedChildren_QMSWraperCtxData_Store([]);
		const mergedChildren_controlPanel_Store = Create_mergedChildren_controlPanel_Store([]);
		const QMSFieldToQMSGetMany_Store = Create_QMSFieldToQMSGetMany_Store([]);

		// Debug logging
		const storesToLog = [
			{ name: '$QMSFieldToQMSGetMany_Store', store: QMSFieldToQMSGetMany_Store },
			{ name: '$mergedChildren_finalGqlArgObj_Store', store: mergedChildren_finalGqlArgObj_Store },
			{
				name: '$mergedChildren_QMSWraperCtxData_Store',
				store: mergedChildren_QMSWraperCtxData_Store
			},
			{ name: '$mergedChildren_controlPanel_Store', store: mergedChildren_controlPanel_Store },
			{ name: '$paginationState', store: paginationState },
			{ name: '$paginationState_derived', store: paginationState_derived }
		];

		const unsubs = storesToLog.map(({ name, store }) => {
			if (store) return store.subscribe((val: any) => Logger.debug(name, val));
			return () => {};
		});

		const QMS_bodyPart_StoreDerived = Create_QMS_bodyPart_StoreDerived(
			current_finalGqlArgObj_Store,
			tableColsData_Store,
			QMSType,
			QMSName,
			paginationOptions,
			paginationState_derived,
			mergedChildren_finalGqlArgObj_Store,
			initialGqlArgObj
		);

		const QMS_bodyPartsUnifier_StoreDerived = Create_QMS_bodyPartsUnifier_StoreDerived(
			[QMS_bodyPart_StoreDerived],
			QMSType
		);
		Logger.debug('QMS_bodyPartsUnifier_StoreDerived', QMS_bodyPartsUnifier_StoreDerived);

		let QMS_bodyPart_StoreDerived_rowsCount = null;
		const rowCountLocation = endpointInfo.get_rowCountLocation(QMS_info, schemaData);
		if (rowCountLocation) {
			const tableColsData_Store_rowsCount = writable([
				{ stepsOfFields: rowCountLocation, title: 'count' }
			]);

			QMS_bodyPart_StoreDerived_rowsCount = Create_QMS_bodyPart_StoreDerived(
				current_finalGqlArgObj_Store,
				tableColsData_Store_rowsCount,
				QMSType,
				rowCountLocation[0],
				paginationOptions,
				paginationState_derived,
				mergedChildren_finalGqlArgObj_Store,
				{}
			);
		}

		const tableName = endpointInfo.get_tableName(QMS_info, schemaData);
		const thisContext = endpointInfo.get_thisContext();
		const objective = 'getOne';
		const qmsNameForObjective = endpointInfo.get_qmsNameForObjective(
			QMS_info,
			schemaData,
			objective
		);

		const idColName = getIdColumnName(
			returningColumnsLocationQMS_Info,
			QMS_info,
			endpointInfo,
			schemaData
		);

		// Update the context object
		Object.assign(QMSWraperContext, {
			idColName,
			returningColumnsLocationQMS_Info,
			rowsLocation,
			returningColumnsLocation,
			QMS_info,
			QMSType,
			QMSName,
			activeArgumentsDataGrouped_Store: current_activeArgumentsDataGrouped_Store,
			tableColsData_Store,
			finalGqlArgObj_Store: current_finalGqlArgObj_Store,
			QMS_bodyPart_StoreDerived,
			QMS_bodyPart_StoreDerived_rowsCount,
			QMS_bodyPartsUnifier_StoreDerived,
			paginationOptions,
			paginationState,
			paginationState_derived,
			mergedChildren_finalGqlArgObj_Store,
			mergedChildren_QMSWraperCtxData_Store,
			mergedChildren_controlPanel_Store,
			QMSFieldToQMSGetMany_Store,
			extraInfo
		});

		Logger.debug('QMSWraper: Context setup complete', { QMSName, QMSType });

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	});
</script>

{#if calculated_isOutermostQMSWraper && $mergedChildren_QMSWraperCtxData_Store}
	{#each $mergedChildren_QMSWraperCtxData_Store as QMSWraperCtxDataCurrent (QMSWraperCtxDataCurrent.stepsOfFields.join())}
		<QMSWraperCtxDataCurrentComputations {QMSWraperCtxDataCurrent} />
	{/each}
{/if}

{#if QMS_info || (preferGivenQMSWraperContext && QMSWraperContextGiven)}
	<!-- content here -->
	{@render children?.()}
{/if}
