// Core GraphQL Types

/**
 * Represents the kind of a GraphQL type.
 */
export type GraphQLKind = 'SCALAR' | 'OBJECT' | 'INTERFACE' | 'UNION' | 'ENUM' | 'INPUT_OBJECT' | 'LIST' | 'NON_NULL';

/**
 * Represents the type of a QMS operation (Query, Mutation, Subscription).
 */
export type QMSType = 'query' | 'mutation' | 'subscription';

/**
 * Represents a named GraphQL type.
 */
export interface GraphQLNamedType {
	name: string;
	kind: GraphQLKind;
}

/**
 * Represents a GraphQL type definition, potentially nested.
 */
export interface GraphQLType {
	name?: string;
	kind?: GraphQLKind;
	type?: GraphQLType;
	ofType?: GraphQLType;
}

/**
 * Represents a field in a GraphQL type.
 */
export interface GraphQLField {
	name: string;
	description?: string;
	args?: GraphQLArgument[];
	type: GraphQLType;
	isDeprecated?: boolean;
	deprecationReason?: string;
}

/**
 * Represents an argument for a GraphQL field.
 */
export interface GraphQLArgument {
	name: string;
	description?: string;
	type: GraphQLType;
	defaultValue?: unknown;
	dd_NON_NULL?: boolean;
	dd_rootName?: string;
	dd_displayName?: string;
	dd_kindList?: boolean;
	dd_isRootArg?: boolean;
}

/**
 * Represents an input field in a GraphQL input object.
 */
export interface GraphQLInputField {
	name: string;
	description?: string;
	type: GraphQLType;
	defaultValue?: unknown;
}

/**
 * Represents a value in a GraphQL Enum.
 */
export interface GraphQLEnumValue {
	name: string;
	description?: string;
	isDeprecated?: boolean;
	deprecationReason?: string;
}

// Derived Data Types (prefixed with dd_)

/**
 * Interface containing derived data calculated for easier UI handling.
 */
export interface DerivedData {
	dd_kindsArray: GraphQLKind[];
	dd_namesArray: string[];
	dd_rootName: string;
	dd_displayName: string;
	dd_relatedRoot: RootType | string; // Can be string for circular reference avoidance
	dd_kindEl?: GraphQLKind;
	dd_kindEl_NON_NULL: boolean;
	dd_kindList: boolean;
	dd_kindList_NON_NULL: boolean;
	dd_NON_NULL: boolean;
	dd_displayInterface?: DisplayInterface;
	dd_isArg: boolean;
	dd_relatedRoot_inputFields_allScalar?: boolean;
	dd_canExpand: boolean;
	dd_shouldExpand: boolean;
	dd_isQMSField: boolean;
	dd_castType: string;
	dd_derivedTypeBorrowed: string;
	dd_baseFilterOperators?: string[];
	dd_nonBaseFilterOperators?: string[];
	dd_isRootArg?: boolean;
	dd_isPaginationArg?: boolean;
	dd_standsFor?: string;
	dd_paginationArgs?: FieldWithDerivedData[];
	dd_paginationType?: string;
	dd_StrForFuseComparison: string;
}

/**
 * Represents a root type in the schema, enriched with derived data.
 */
export interface RootType extends GraphQLNamedType, Partial<DerivedData> {
	fields?: FieldWithDerivedData[];
	inputFields?: InputFieldWithDerivedData[];
	enumValues?: GraphQLEnumValue[];
	interfaces?: GraphQLNamedType[];
	possibleTypes?: GraphQLNamedType[];
	description?: string;
}

/**
 * Represents a field enriched with derived data.
 */
export interface FieldWithDerivedData extends GraphQLField, DerivedData {}

/**
 * Represents an input field enriched with derived data.
 */
export interface InputFieldWithDerivedData extends GraphQLInputField, DerivedData {}

// Schema Data Types
import type { Readable } from 'svelte/store';

/**
 * Holds the parsed schema data including root types and fields for operations.
 */
export interface SchemaData {
	rootTypes: RootType[];
	queryFields: FieldWithDerivedData[];
	mutationFields: FieldWithDerivedData[];
	subscriptionFields: FieldWithDerivedData[];
	schema?: any;
	isReady?: boolean;
}

/**
 * Svelte store for Schema Data with helper methods.
 */
export interface SchemaDataStore extends Readable<SchemaData> {
	set: (value: SchemaData) => void;
	update: (updater: (value: SchemaData) => SchemaData) => void;
	set_schema: (schema: any) => void;
	set_rootTypes: (withDerivedData: boolean, set_storeVal: boolean, endpointInfo: EndpointInfoStore) => RootType[];
	set_QMSFields: (withDerivedData: boolean, set_storeVal: boolean, QMS: string[], endpointInfo: EndpointInfoStore) => Record<string, FieldWithDerivedData[]>;
	set_fields: (endpointInfo: EndpointInfoStore) => void;
	get_rootType: (rootTypes: RootType[] | null, rootTypeName: string, schemaData: SchemaDataStore) => RootType | undefined;
	get_QMS_Field: (qmsName: string, qmsType: QMSType, schemaData: SchemaDataStore) => FieldWithDerivedData | undefined;
}

// Display Interface Types

/**
 * types of interfaces available for displaying data.
 */
export type DisplayInterface = 'text' | 'number' | 'datetime-local' | 'geo' | 'boolean' | 'ENUM' | 'codeeditor' | null;

/**
 * Extra data associated with a type for display purposes.
 */
export interface TypeExtraData {
	displayInterface: DisplayInterface;
	defaultValue: unknown;
	use_transformerREVERSE: (val: unknown) => unknown;
	use_transformer: (val: unknown) => unknown;
}

// Pagination Types

/**
 * Represents different pagination strategies/keywords.
 */
export type PaginationStand = 'limit' | 'offset' | 'first' | 'last' | 'after' | 'before' | 'from' | 'page';

/**
 * Represents the current state of pagination.
 */
export interface PaginationState {
	[key: string]: unknown;
}

/**
 * Info and logic for a specific pagination type.
 */
export interface PaginationTypeInfo {
	name: string;
	check: (standsForArray: string[]) => boolean;
	get_rowLimitingArgNames?: (paginationArgs: FieldWithDerivedData[]) => (string | undefined)[];
	get_dependencyColsData?: (qmsName: string, qmsType: QMSType, schemaData: SchemaDataStore) => unknown[];
	get_initialState: (paginationArgs: FieldWithDerivedData[]) => PaginationState;
	get_nextPageState: (currentState: PaginationState, paginationArgs: FieldWithDerivedData[], returnedDataBatch_last?: unknown, qmsName?: string, qmsType?: QMSType) => PaginationState;
	get_prevPageState: (currentState: PaginationState, paginationArgs: FieldWithDerivedData[], returnedDataBatch_last?: unknown, qmsName?: string, qmsType?: QMSType) => PaginationState;
	get_defaultPaginationStateForDynamic: (currentState: PaginationState, paginationArgs: FieldWithDerivedData[]) => PaginationState;
	isFirstPage?: (paginationStateStore: PaginationStateStore, paginationArgs: FieldWithDerivedData[]) => boolean;
}

// Column Data Types

/**
 * Represents nested fields selection for a query.
 */
export interface StepsOfFieldsObject {
	[key: string]: StepsOfFieldsObject | string;
}

/**
 * Data defining a table column and how to fetch its data.
 */
export interface TableColumnData {
	title: string;
	stepsOfFields?: string[];
	stepsOfFieldsOBJ?: StepsOfFieldsObject;
	stepsOfFieldsForDataGetter?: string[];
}

// Active Argument Types

/**
 * Represents an argument currently being used/configured in the UI.
 */
export interface ActiveArgumentData extends Partial<FieldWithDerivedData> {
	id: string;
	stepsOfFields: string[];
	stepsOfFieldsStringified: string;
	inUse?: boolean;
	chd_rawValue?: unknown;
	chd_dispatchValue?: unknown;
	chd_chosen?: boolean;
	gqlArgObj?: Record<string, unknown>;
	canRunQuery?: boolean;
	not?: boolean;
	inputFields?: InputFieldWithDerivedData[];
	enumValues?: GraphQLEnumValue[];
	selectedRowsColValues?: Record<string, unknown>[];
}

/**
 * Represents a container for arguments (e.g. for filters like AND/OR).
 */
export interface ContainerData extends ActiveArgumentData {
	operator: 'bonded' | 'list' | '_and' | '_or' | '_not' | 'and' | 'or' | 'not' | '~spread~';
	items: ContainerItem[];
	isMain?: boolean;
	stepsOfNodes?: unknown[];
	parent_node?: ContainerData;
	addDefaultFields?: boolean;
}

export interface ContainerItem {
	id: string;
}

/**
 * Represents a group of active arguments.
 */
export interface ActiveArgumentGroup {
	originType: FieldWithDerivedData;
	group_name: string;
	group_isRoot: boolean;
	group_hasAllArgs?: boolean;
	group_args: ActiveArgumentData[];
	group_argsNode?: Record<string, ContainerData>;
	group_gqlArgObj?: Record<string, unknown>;
	group_gqlArgObj_string?: string;
	group_canRunQuery?: boolean;
	dd_kindList?: boolean;
}

// Endpoint Configuration Types

export interface RowsLocationPossibility {
	get_Val: (qmsInfo: FieldWithDerivedData, schemaData?: SchemaDataStore) => string[];
	check: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => boolean;
}

export interface IdFieldPossibility {
	get_Val: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore, storeVal?: any) => FieldWithDerivedData | undefined;
	check: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore, storeVal?: any) => boolean | FieldWithDerivedData | undefined;
}

export interface TypeExtraDataPossibility {
	get_Val: (typeInfo?: FieldWithDerivedData) => TypeExtraData;
	check: (dd_rootName: string, dd_displayName: string, typeObj: Partial<FieldWithDerivedData>) => boolean | null;
}

export interface IdDecoderPossibility {
	get_Val: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore, id: string) => string;
	check: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => boolean;
}

/**
 * Configuration options for an endpoint, including heuristics for identifying fields.
 */
export interface EndpointConfiguration {
	url?: string;
	headers?: Record<string, string>;
	description?: string;
	id?: string;
	isMantained?: boolean;
	rowsLocationPossibilities?: RowsLocationPossibility[];
	rowCountLocationPossibilities?: RowsLocationPossibility[];
	relayPageInfoFieldsPossibleNames?: Record<string, string[]>;
	relayCursorPossibleNames?: Record<string, string[]>;
	paginationArgsPossibleNames?: Record<string, string[]>;
	idFieldPossibilities?: IdFieldPossibility[];
	typesExtraDataPossibilities?: TypeExtraDataPossibility[];
	idDecoderPossibilities?: IdDecoderPossibility[];
	returningColumnsPossibleLocationsInMutations?: string[][];
	returningColumnsPossibleLocationsInQueriesPerRow?: string[][];
	inputColumnsPossibleLocationsInArg?: string[][];
	pageInfoFieldsLocation?: string[];
	tableNamePossibilities?: {
		get_Val: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => string | null;
		check: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => boolean;
	}[];
	qmsNameForObjectivePossibilities?: {
		get_Val: (params: QMSObjectiveParams) => string | null;
		check: (params: QMSObjectiveParams) => boolean;
	}[];
}

export interface QMSObjectiveParams {
	QMS_info: FieldWithDerivedData;
	schemaData: SchemaDataStore;
	thisContext: EndpointInfoStore;
	tableName: string;
	qmsObjective: string;
}

// Store Types

/**
 * Svelte store for endpoint info.
 */
export interface EndpointInfoStore {
	subscribe: (run: (value: EndpointConfiguration) => void) => () => void;
	set: (value: EndpointConfiguration) => void;
	update: (updater: (value: EndpointConfiguration) => EndpointConfiguration) => void;
	get_thisContext: () => EndpointInfoStore;
	smartSet: (newEndpoint: EndpointConfiguration) => void;
	get_inputFieldsContainerLocation: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => string[];
	get_rowsLocation: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => string[];
	get_rowCountLocation: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => string[] | null;
	get_idField: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => FieldWithDerivedData | null;
	get_typeExtraData: (typeInfo: Partial<FieldWithDerivedData>, choosenDisplayInterface?: DisplayInterface) => TypeExtraData | null;
	get_tableName: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore) => string | null;
	get_qmsNameForObjective: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore, qmsObjective: string) => string | null;
	get_decodedId: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore, id: string) => string | null;
	get_relayPageInfoFieldsNames: (currentQmsInfo: FieldWithDerivedData, pageInfoFieldsLocation: string[], schemaData: SchemaDataStore) => Record<string, string> | null;
	get_relayCursorFieldName: (currentQmsInfo: FieldWithDerivedData, rowsLocation: string[], schemaData: SchemaDataStore) => Record<string, string> | null;
}

/**
 * Svelte store for managing active arguments grouped by type.
 */
export interface ActiveArgumentsDataGroupedStore {
	subscribe: (run: (value: ActiveArgumentGroup[]) => void) => () => void;
	set: (value: ActiveArgumentGroup[]) => void;
	update: (updater: (value: ActiveArgumentGroup[]) => ActiveArgumentGroup[]) => void;
	set_groups: (qmsInfo: FieldWithDerivedData, schemaData: SchemaDataStore, qmsArguments: Record<string, unknown> | null, endpointInfo: EndpointInfoStore) => void;
	update_groups: (groupNewData: ActiveArgumentGroup) => void;
	update_activeArgument: (activeArgumentData: ActiveArgumentData, groupName: string) => void;
	delete_activeArgument: (activeArgumentData: ActiveArgumentData, groupName: string) => void;
	get_activeArgument: (stepsOfFields: string[], groupName?: string) => ActiveArgumentData | undefined;
	add_activeArgument: (newArgumentOrContainerData: ActiveArgumentData | ContainerData, groupName: string, parentContainerId: string | null, endpointInfo: EndpointInfoStore) => void;
}

/**
 * Svelte store for table column data.
 */
export interface TableColsDataStore {
	subscribe: (run: (value: TableColumnData[]) => void) => () => void;
	set: (value: TableColumnData[]) => void;
	update: (updater: (value: TableColumnData[]) => TableColumnData[]) => void;
	addColumns: (newColsData: TableColumnData[]) => void;
	addColumn: (newColData: TableColumnData) => void;
	removeColumn: (colToRemoveData_title: string) => void;
}

/**
 * Svelte store for pagination state.
 */
export interface PaginationStateStore {
	subscribe: (run: (value: PaginationState) => void) => () => void;
	set: (value: PaginationState) => void;
	update: (updater: (value: PaginationState) => PaginationState) => void;
	nextPage: (returnedDataBatch_last: unknown, qmsName: string, qmsType: QMSType) => void;
	prevPage: (returnedDataBatch_last: unknown, qmsName: string, qmsType: QMSType) => void;
	resetToDefault: () => void;
}

// GQL Argument Object Types

export interface GQLArgObj {
	arg_gqlArgObj: Record<string, unknown>;
	arg_canRunQuery: boolean;
	gqlArgObj: Record<string, unknown>;
	canRunQuery: boolean;
	note: string;
}

export interface FinalGQLArgObj {
	finalGqlArgObj: Record<string, unknown>;
	final_canRunQuery: boolean;
}

// Fields Grouped Types

export interface FieldsGrouped {
	scalarFields: FieldWithDerivedData[];
	non_scalarFields: FieldWithDerivedData[];
	enumFields: (RootType & FieldWithDerivedData)[];
}

// Available Endpoints

export interface AvailableEndpoint extends EndpointConfiguration {
	id: string;
	url: string;
	description: string;
	isMantained?: boolean;
}

// Context Types

export interface QMSMainWraperContext {
	endpointInfo: EndpointInfoStore;
	schemaData: SchemaDataStore;
	urqlCoreClient: any;
}

export interface QMSWraperContext {
	idColName: string;
	returningColumnsLocationQMS_Info: FieldWithDerivedData | undefined;
	rowsLocation: string[];
	returningColumnsLocation: string[];
	QMS_info: FieldWithDerivedData | undefined;
	QMSType: QMSType;
	QMSName: string;
	activeArgumentsDataGrouped_Store: ActiveArgumentsDataGroupedStore;
	tableColsData_Store: TableColsDataStore;
	finalGqlArgObj_Store: any;
	QMS_bodyPart_StoreDerived: any;
	QMS_bodyPart_StoreDerived_rowsCount: any;
	QMS_bodyPartsUnifier_StoreDerived: any;
	paginationOptions: any;
	paginationState: PaginationStateStore;
	paginationState_derived: any;
	mergedChildren_finalGqlArgObj_Store: any;
	mergedChildren_QMSWraperCtxData_Store: any;
	mergedChildren_controlPanel_Store: any;
	QMSFieldToQMSGetMany_Store: any;
	extraInfo: Record<string, unknown>;
}
