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
	import { getContext, setContext, onDestroy } from 'svelte';
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

	// Move logic after props destructuring to avoid TDZ
	let QMSMainWraperContext = getContext<QMSMainWraperContextType>(`${prefix}QMSMainWraperContext`);
	const endpointInfo: EndpointInfoStore = QMSMainWraperContext?.endpointInfo;
	const schemaData: SchemaDataStore = QMSMainWraperContext?.schemaData;

    Logger.debug('QMSWraper initialized', { QMSName, QMSType });

    // Hoist Store Declarations
    let tableColsData_Store: any;
    let QMS_bodyPart_StoreDerived: any;
    let QMS_bodyPart_StoreDerived_rowsCount: any = null;
    let QMS_bodyPartsUnifier_StoreDerived: any;
    let paginationOptions: any;
    let paginationState: any;
    let paginationState_derived: any;
    let mergedChildren_finalGqlArgObj_Store: any;
    let mergedChildren_QMSWraperCtxData_Store: any = writable([]);
    let mergedChildren_controlPanel_Store: any;
    let QMSFieldToQMSGetMany_Store: any;

    let idColName: any;
    let returningColumnsLocationQMS_Info: any;
    let rowsLocation: any;
    let returningColumnsLocation: any;


	// Calculate defaults that depend on other props/context
	if (isOutermostQMSWraper === undefined) {
		isOutermostQMSWraper = getContext<QMSWraperContextType>(`${prefix}QMSWraperContext`) ? false : true;
	}

	if (!QMS_info && schemaData) {
		QMS_info = schemaData.get_QMS_Field(QMSName, QMSType, schemaData);
	}

	if (!activeArgumentsDataGrouped_Store) {
		activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store(
			activeArgumentsDataGrouped_StoreInitialValue
		);
	}

	// Logic from original file, but safe now
	if (!QMS_info) {
		Logger.warn(`QMS_info not found for ${QMSName} ${QMSType}`);
        // Maybe handle error?
	} else {
        const dd_paginationType: string | undefined = QMS_info?.dd_paginationType;
        const paginationTypes = get_paginationTypes(endpointInfo, schemaData);
        let paginationTypeInfo = getPaginationTypeInfo(dd_paginationType, paginationTypes);
        Logger.debug({ QMSType, QMSName, QMS_info });

        paginationOptions = Create_paginationOptions();
        paginationState = Create_paginationState(
            undefined,
            QMS_info.dd_paginationArgs,
            QMS_info.dd_paginationType,
            endpointInfo,
            schemaData
        );
        paginationState_derived = Create_paginationState_derived(
            paginationState,
            QMS_info.dd_paginationArgs,
            QMS_info.dd_paginationType,
            endpointInfo,
            schemaData
        );

        if (!finalGqlArgObj_Store) {
             finalGqlArgObj_Store = Create_finalGqlArgObj_Store(
                activeArgumentsDataGrouped_Store,
                paginationState
            );
        }

        rowsLocation = endpointInfo.get_rowsLocation(QMS_info, schemaData);
        const nodeFieldsQMS_info = get_nodeFieldsQMS_info(QMS_info, rowsLocation, schemaData);
        Logger.debug({ nodeFieldsQMS_info });

        const possibleLocations = QMSType == 'query'
			? (get(endpointInfo) as any).returningColumnsPossibleLocationsInQueriesPerRow
			: (get(endpointInfo) as any).returningColumnsPossibleLocationsInMutations;

        const returningColumnsResult = findReturningColumnsLocation(
            nodeFieldsQMS_info,
            possibleLocations,
            schemaData,
            'fields'
        );

        returningColumnsLocationQMS_Info = returningColumnsResult?.info;
        returningColumnsLocation = returningColumnsResult?.location || [];

        Logger.debug({ returningColumnsLocationQMS_Info, returningColumnsLocation, QMSType });

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

        const dependencyColsData = paginationTypeInfo?.get_dependencyColsData(
            QMSName,
            'query',
            schemaData
        ) || [];

        tableColsData_StoreInitialValue = mergeColumnData(
            scalarColsData,
            tableColsData_StoreInitialValue,
            dependencyColsData
        );
        Logger.debug({
            QMSType,
            QMSName,
            QMS_info,
            // schemaData,
            nodeFieldsQMS_info,
            // nodeFieldsQMS_info_Root,
            returningColumnsLocation,
            returningColumnsLocationQMS_Info,
            prefixStepsOfFields,
            scalarColsData,
            dependencyColsData,
            tableColsData_StoreInitialValue
        });
        tableColsData_Store = Create_tableColsData_Store(
            paginationState,
            tableColsData_StoreInitialValue
        );

        mergedChildren_finalGqlArgObj_Store = Create_mergedChildren_finalGqlArgObj_Store({});
        mergedChildren_QMSWraperCtxData_Store = Create_mergedChildren_QMSWraperCtxData_Store([]);
        mergedChildren_controlPanel_Store = Create_mergedChildren_controlPanel_Store([]);
        QMSFieldToQMSGetMany_Store = Create_QMSFieldToQMSGetMany_Store([]);

        // Debug logging using manual subscribe to avoid $ syntax issues in block or conditional effects
        // Using a helper to log on change
        const logStore = (name: string, store: any) => {
            if (store) {
                 const unsub = store.subscribe((val: any) => Logger.debug(name, val));
                 onDestroy(unsub);
            }
        };

        logStore('$QMSFieldToQMSGetMany_Store', QMSFieldToQMSGetMany_Store);
        logStore('$mergedChildren_finalGqlArgObj_Store', mergedChildren_finalGqlArgObj_Store);
        logStore('$mergedChildren_QMSWraperCtxData_Store', mergedChildren_QMSWraperCtxData_Store);
        logStore('$mergedChildren_controlPanel_Store', mergedChildren_controlPanel_Store);


        QMS_bodyPart_StoreDerived = Create_QMS_bodyPart_StoreDerived(
            finalGqlArgObj_Store,
            tableColsData_Store,
            QMSType,
            QMSName,
            paginationOptions,
            paginationState_derived,
            mergedChildren_finalGqlArgObj_Store,
            initialGqlArgObj
        );

        QMS_bodyPartsUnifier_StoreDerived = Create_QMS_bodyPartsUnifier_StoreDerived(
            [QMS_bodyPart_StoreDerived],
            QMSType
        );
        Logger.debug('QMS_bodyPartsUnifier_StoreDerived', QMS_bodyPartsUnifier_StoreDerived);

        // Logger.debug(schemaData);
        const rowCountLocation = endpointInfo.get_rowCountLocation(QMS_info, schemaData);
        Logger.debug({ rowCountLocation }, get(endpointInfo));
        if (rowCountLocation) {
            const tableColsData_Store_rowsCount = writable([
                { stepsOfFields: rowCountLocation, title: 'count' }
            ]);

            QMS_bodyPart_StoreDerived_rowsCount = Create_QMS_bodyPart_StoreDerived(
                finalGqlArgObj_Store,
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
        Logger.debug({ tableName });
        const thisContext = endpointInfo.get_thisContext();
        Logger.debug({ thisContext });
        const objective = 'getOne';
        const qmsNameForObjective = endpointInfo.get_qmsNameForObjective(QMS_info, schemaData, objective);
        Logger.debug({ qmsNameForObjective }, objective);

        idColName = getIdColumnName(
            returningColumnsLocationQMS_Info,
            QMS_info,
            endpointInfo,
            schemaData
        );

        logStore('$paginationState', paginationState);
        logStore('$paginationState_derived', paginationState_derived);

        QMSWraperContext = {
            idColName,
            returningColumnsLocationQMS_Info,
            rowsLocation,
            returningColumnsLocation,
            QMS_info,
            QMSType,
            QMSName,
            activeArgumentsDataGrouped_Store,
            tableColsData_Store,
            finalGqlArgObj_Store,
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
        };

        if (preferGivenQMSWraperContext && QMSWraperContextGiven) {
            QMSWraperContext = QMSWraperContextGiven;
        }
        setContext<QMSWraperContextType>(`${prefix}QMSWraperContext`, QMSWraperContext as QMSWraperContextType);
        if (isOutermostQMSWraper) {
            setContext<QMSWraperContextType>(`${prefix}OutermostQMSWraperContext`, QMSWraperContext as QMSWraperContextType);
        }
    }
</script>

{#if isOutermostQMSWraper && $mergedChildren_QMSWraperCtxData_Store}
	{#each $mergedChildren_QMSWraperCtxData_Store as QMSWraperCtxDataCurrent (QMSWraperCtxDataCurrent.stepsOfFields.join())}
		<QMSWraperCtxDataCurrentComputations {QMSWraperCtxDataCurrent} />
	{/each}
{/if}

{#if QMS_info || (preferGivenQMSWraperContext && QMSWraperContextGiven)}
	<!-- content here -->
	{@render children?.()}
{/if}
