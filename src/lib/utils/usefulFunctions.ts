//QMS means QueryOrMutationOrSubscription
import _ from 'lodash';
import { get } from 'svelte/store';
import { page } from '$app/stores';
import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';
import { getContext } from 'svelte';
import {
	stringToQMSString_transformer,
	string_transformer
} from '$lib/utils/dataStructureTransformers';
import { Logger } from '$lib/utils/logger';
import type {
	GraphQLKind,
	QMSType,
	FieldWithDerivedData,
	RootType,
	SchemaData,
	SchemaDataStore,
	EndpointInfoStore,
	ActiveArgumentData,
	ActiveArgumentGroup,
	ContainerData,
	GQLArgObj,
	FinalGQLArgObj,
	FieldsGrouped,
	TableColumnData,
	StepsOfFieldsObject,
	PaginationStateStore,
	ActiveArgumentsDataGroupedStore
} from '$lib/types';

/**
 * Recursively finds a nested child object that has multiple keys or if the last key is 'QMSarguments'.
 * @param obj - The object to search within.
 * @returns The found object, true if 'QMSarguments' is the only key, or null if not found.
 */
export const findNestedChildWithMultipleKeysOrIfLastHasQMSargumentsKey = (
	obj: unknown
): Record<string, unknown> | boolean | null => {
	// Check if the input is an object
	if (typeof obj !== 'object' || obj === null) {
		return null;
	}
	const objectKeys = Object.keys(obj);
	const objectKeysLength = objectKeys.length;
	if (objectKeysLength > 1) {
		return obj as Record<string, unknown>;
	}
	if (obj.hasOwnProperty('QMSarguments') && objectKeysLength == 1) {
		return true;
	}
	if (objectKeysLength == 1) {
		return findNestedChildWithMultipleKeysOrIfLastHasQMSargumentsKey((obj as any)[objectKeys[0]]);
	}
	return null;
};

/**
 * Removes nested objects if they contain only one key and that key is 'QMSarguments'.
 * @param obj - The object to modify.
 * @returns The modified object or null.
 */
export const deleteIfChildrenHaveOneKeyAndLastKeyIsQMSarguments = (
	obj: unknown
): Record<string, unknown> | null => {
	if (getPreciseType(obj) !== 'object' || obj === null) {
		return null;
	}
	Logger.debug('deleteIfChildrenHaveOneKeyAndLastKeyIsQMSarguments', { obj });

	for (const key in obj as Record<string, any>) {
		const typedObj = obj as Record<string, any>;
		const keys = Object.keys(typedObj[key]);
		const numberOfKeys = keys.length;
		if (numberOfKeys == 1 && typedObj[key][keys[0]] == 'QMSarguments') {
			delete typedObj[key];
			return typedObj;
		}
		const result = findNestedChildWithMultipleKeysOrIfLastHasQMSargumentsKey(typedObj[key]);
		if (result === true) {
			delete typedObj[key];
		}
		if (getPreciseType(result) == 'object') {
			deleteIfChildrenHaveOneKeyAndLastKeyIsQMSarguments(typedObj[key]);
		}
	}
	return obj as Record<string, unknown>;
};

/**
 * Checks if an object is empty.
 * @param obj - The object to check.
 * @returns True if the object is empty, false otherwise.
 */
export const objectIsEmpty = (obj: Record<string, unknown>): boolean => {
	if (Object.keys(obj).length === 0 && obj.constructor === Object) {
		return true;
	} else {
		return false;
	}
};

/**
 * Builds the body part of a QMS query string.
 * @param QMS_name - The name of the query/mutation/subscription.
 * @param QMS_fields - The fields to select.
 * @param QMS_args - The arguments for the operation.
 * @param QMS_type - The type of operation (query, mutation, subscription).
 * @param mergedChildren_finalGqlArgObj - Merged arguments from children.
 * @returns The generated QMS body string or null if invalid.
 */
export const build_QMS_bodyPart = (
	QMS_name: string,
	QMS_fields: Record<string, unknown>,
	QMS_args: Record<string, unknown>,
	QMS_type: QMSType = 'query',
	mergedChildren_finalGqlArgObj: Record<string, unknown>
): string | null => {
	if (Object.keys(QMS_fields).length == 0) {
		Logger.error('no cols data,choose at least one field');
		return null;
	}
	if (Object.keys(QMS_args).length == 0) {
		Logger.info('no args chosen');
	}

	Logger.debug('build_QMS_bodyPart inputs', {
		QMS_args,
		QMS_fields,
		mergedChildren_finalGqlArgObj
	});
	const QMSarguments = { [QMS_name]: { QMSarguments: QMS_args } };
	const fullObject = JSON.parse(
		JSON.stringify(
			deleteIfChildrenHaveOneKeyAndLastKeyIsQMSarguments(
				_.mergeWith({}, QMSarguments, mergedChildren_finalGqlArgObj, QMS_fields)
			)
		)
	);

	const inputString = JSON.stringify(fullObject, function (key, value) {
		if (key === 'QMSarguments') {
			// Logger.debug('QMSarguments', { value }, JSON.stringify(value))
			return '(' + JSON.stringify(value) + ')';
		}
		return value;
	}).replaceAll('\"QMSarguments\":', '');
	const listOfSubstrings = generateListOfSubstrings(inputString);
	// Logger.debug({ listOfSubstrings })

	const outsideTextModifier = (text: string): string => {
		return text.replaceAll(/novaluehere|"|:/gi, '');
	};

	const modifiedString = smartModifyStringBasedOnBoundries(
		listOfSubstrings.join(''),
		'(',
		')',
		stringToQMSString_transformer as any,
		outsideTextModifier
	);

	Logger.debug({ modifiedString });
	const QMS_bodyPart = modifiedString.slice(1, -1);

	// Logger.debug({ QMS_bodyPart })
	return QMS_bodyPart;
};

/**
 * Modifies a string based on boundary characters (e.g., parentheses), applying different transformations to inside and outside text.
 * @param inputString - The input string.
 * @param openBoundryChar - The starting boundary character.
 * @param closeBoundryChar - The ending boundary character.
 * @param insideTextModifier - Function to modify text inside boundaries.
 * @param outsideTextModifier - Function to modify text outside boundaries.
 * @param deleteBoundriesIfTextInsideIsEmpty - Whether to remove boundaries if the inside text is empty.
 * @returns The modified string.
 */
export const smartModifyStringBasedOnBoundries = (
	inputString: string,
	openBoundryChar = '(',
	closeBoundryChar = ')',
	insideTextModifier: ((text: string) => string) | undefined,
	outsideTextModifier: ((text: string) => string) | undefined,
	deleteBoundriesIfTextInsideIsEmpty = true
): string => {
	if (!inputString.includes(openBoundryChar)) {
		return inputString;
	}
	const result: string[] = [];
	//let splitByOpened=inputString.split('(')
	const splitByClosed = inputString.split(closeBoundryChar);
	splitByClosed.forEach((element) => {
		const splitByOpen = element.split(openBoundryChar);
		let outsidePart = splitByOpen[0];
		let insidePart = splitByOpen[1];
		if (outsidePart) {
			if (getPreciseType(outsideTextModifier) === 'function' && outsideTextModifier) {
				outsidePart = outsideTextModifier(outsidePart);
			}
			result.push(outsidePart);
		}
		if (insidePart) {
			if (getPreciseType(insideTextModifier) === 'function' && insideTextModifier) {
				insidePart = insideTextModifier(insidePart);
			}
			if (deleteBoundriesIfTextInsideIsEmpty && insidePart == '') {
				result.push(``);
			} else {
				result.push(`${openBoundryChar}${insidePart}${closeBoundryChar}`);
			}
		}
	});

	return result.join('');
};
///
function replaceLastOccurrence(str: string, MaxIndex: number, REPLACEMENT_STRING: string): string {
	// Find the index of the first occurrence of ":{" after the first character
	const startIndex = str.indexOf(':{', 1);

	// If the first occurrence is found
	if (startIndex !== -1) {
		// Find the index of the last occurrence of ":{" before the fourth character
		const lastIndex = str.lastIndexOf(':{', MaxIndex);

		// If the last occurrence is found
		if (lastIndex !== -1) {
			// Replace the last occurrence with a new string (e.g., "REPLACEMENT_STRING")
			const replacedString =
				str.substring(0, lastIndex) + REPLACEMENT_STRING + str.substring(lastIndex + 2);

			return replacedString;
		}
	}

	// If no occurrences are found, return the original string
	return str;
}

const replaceBetween = function (string: string, start: number, end: number, what: string): string {
	return string.substring(0, start) + what + string.substring(end);
};
function modifyString(input: string): { modifiedSubstring: string; remainingString: string } {
	// Step 1: Match the first parenthesis and the text inside them
	const matchParenthesis = input.match(/\(([^)]+)\)/);
	let remainingString: string;
	let modifiedSubstring: string;
	if (!matchParenthesis) {
		modifiedSubstring = input;
		remainingString = '';
		return { modifiedSubstring, remainingString };
	}
	const parenhtesisLength = matchParenthesis[0].length;
	const parenhtesisStart = matchParenthesis.index || 0;
	const parenhtesisEnd = parenhtesisStart + parenhtesisLength;

	//delete matched parenthesis and it's content from string
	input = replaceBetween(input, parenhtesisStart, parenhtesisEnd, '');
	//console.log({ matchParenthesis }, matchParenthesis.index)
	input = replaceLastOccurrence(input, matchParenthesis.index || 0, matchParenthesis[0] + ':{');
	modifiedSubstring = input.substring(0, parenhtesisEnd);
	remainingString = input.substring(parenhtesisEnd, input.length);
	// Return the original string if no match is found
	return { modifiedSubstring, remainingString };
}
const generateListOfSubstrings = (string: string): string[] => {
	const substrings: string[] = [];
	let reachedTheEnd = false;
	while (!reachedTheEnd) {
		const { modifiedSubstring, remainingString } = modifyString(string);
		//console.log({ remainingString })
		if (remainingString === '') {
			reachedTheEnd = true;
		}
		substrings.push(modifiedSubstring);
		string = remainingString;
	}
	return substrings;
};
const inputString2 =
	'query QMS_name{ authUserRoles:{ createdAt,id,role,userId,(order_by:[{createdAt:asc_nulls_last},{userId:desc_nulls_first}],limit:20,offset:0)roleByRole{role,userRoles_aggregate{nodes{id},aggregate{count}}} } }';

// Example usage:
const inputString =
	":{textBefore:{1dadas,2dasda,(inside parentheses1{iside1:'asd1'}),3dasds :{ textBefore2:{4dadas,5dasda,(inside parentheses2,inside2:'asd2'),6dasds :{";
// const modifiedResult = modifyString(inputString); // Debugging

//console.log(modifiedResult);
//console.log(replaceLastOccurrence("abc:{def:{ghi:{jkl", 10, "(fdsfds):{"));
//console.log('-------------------------------')
//console.log(inputString)
// const listOfSubstrings = generateListOfSubstrings(inputString) // Debugging
//console.log(inputString)
//console.log({ listOfSubstrings })
//console.log("joined", listOfSubstrings.join(''))
///

/**
 * Extracts all GraphQL kinds from a type definition, drilling down through nested types.
 * @param type - The GraphQL type definition.
 * @returns An array of GraphQLKind strings.
 */
export const get_KindsArray = (type: Partial<FieldWithDerivedData> | any): GraphQLKind[] => {
	const kinds: GraphQLKind[] = [];

	if (type?.kind) {
		kinds.push(type?.kind);
	}
	if (type?.type?.kind) {
		kinds.push(type?.type?.kind);
	}
	if (type?.ofType?.kind) {
		kinds.push(type?.ofType?.kind);
	}
	if (type?.type?.ofType?.kind) {
		kinds.push(type?.type?.ofType?.kind);
	}
	if (type?.ofType?.ofType?.kind) {
		kinds.push(type?.ofType?.ofType?.kind);
	}
	if (type?.type?.ofType?.ofType?.kind) {
		kinds.push(type?.type?.ofType?.ofType?.kind);
	}
	if (type?.ofType?.ofType?.ofType?.kind) {
		kinds.push(type?.ofType?.ofType?.ofType?.kind);
	}
	if (type?.type?.ofType?.ofType?.ofType?.kind) {
		kinds.push(type?.type?.ofType?.ofType?.ofType?.kind);
	}

	return kinds;
};

/**
 * Extracts all names from a type definition, drilling down through nested types.
 * @param type - The GraphQL type definition.
 * @returns An array of name strings.
 */
export const get_NamesArray = (type: Partial<FieldWithDerivedData> | any): string[] => {
	const names: string[] = [];

	if (type?.name) {
		names.push(type?.name);
	}
	if (type?.type?.name) {
		names.push(type?.type?.name);
	}
	if (type?.ofType?.name) {
		names.push(type?.ofType?.name);
	}
	if (type?.type?.ofType?.name) {
		names.push(type?.type?.ofType?.name);
	}
	if (type?.type?.ofType?.ofType?.name) {
		names.push(type?.type?.ofType?.ofType?.name);
	}
	if (type?.type?.ofType?.ofType?.ofType?.name) {
		names.push(type?.type?.ofType?.ofType?.ofType?.name);
	}
	return names;
};

export const get_rootName = (namesArray: string[]): string => {
	return namesArray[namesArray.length - 1];
};

export const get_displayName = (namesArray: string[]): string => {
	return namesArray[0];
};

/**
 * Retrieves a root type definition from the schema data.
 * @param rootTypes - The list of root types (optional if schemaData is provided).
 * @param RootType_Name - The name of the root type to retrieve.
 * @param schemaData - The schema data store or value.
 * @returns The found RootType or undefined.
 */
export const getRootType = (
	rootTypes: RootType[] | null,
	RootType_Name: string | undefined,
	schemaData: SchemaDataStore | SchemaData
): RootType | undefined => {
	if (!rootTypes) {
		// Handle both store and value
		if ('subscribe' in schemaData) {
			rootTypes = get(schemaData).rootTypes;
		} else {
			rootTypes = schemaData.rootTypes;
		}
	}

	return rootTypes.filter((type) => {
		return type.name == RootType_Name;
	})[0];
};

/**
 * Retrieves a field from the schema data.
 * @param name - The name of the field to retrieve.
 * @param _QMS_ - The type of operation (query, mutation, subscription).
 * @param schemaData - The schema data store or value.
 * @returns The found FieldWithDerivedData or undefined.
 */
export const get_QMS_Field = (
	name: string,
	_QMS_: QMSType,
	schemaData: SchemaDataStore | SchemaData
): FieldWithDerivedData | undefined => {
	let storeValue: SchemaData;
	if ('subscribe' in schemaData) {
		storeValue = get(schemaData);
	} else {
		storeValue = schemaData;
	}

	const key = `${_QMS_}Fields` as keyof SchemaData;
	const list = storeValue[key] as any[];

	const QMSField = list?.filter((field: any) => {
		return field.name == name;
	})[0];

	if (!QMSField) {
		// console.info({ QMSField }, name, { storeValue }, list)
	}
	return QMSField;
};

/**
 * Groups fields of a type into scalar, non-scalar, and enum fields.
 * @param node - The node (type or field) to inspect.
 * @param dd_displayNameToExclude - List of display names to exclude.
 * @param schemaData - The schema data store or value.
 * @returns An object containing arrays of grouped fields.
 */
export const getFields_Grouped = (
	node: Partial<FieldWithDerivedData> | RootType,
	dd_displayNameToExclude: string[] = [],
	schemaData: SchemaDataStore | SchemaData
): FieldsGrouped => {
	// Helper to handle both store and value for recursive calls
	const getRootTypeHelper = (rtName: string | undefined) => getRootType(null, rtName, schemaData);

	const node_rootType = getRootTypeHelper(
		node?.dd_rootName || (node as any).parent_node?.dd_rootName
	);
	const scalarFields: FieldWithDerivedData[] = [];
	const non_scalarFields: FieldWithDerivedData[] = [];
	const enumFields: (RootType & FieldWithDerivedData)[] = [];

	let fieldsArray;
	if ((node as any)?.args) {
		fieldsArray = (node as any)?.args;
	} else if (node_rootType?.fields) {
		fieldsArray = node_rootType?.fields;
	} else if (node_rootType?.inputFields) {
		fieldsArray = node_rootType?.inputFields;
	} else if (node_rootType?.enumValues) {
		fieldsArray = (node as any)?.enumValues;
	}

	fieldsArray
		?.filter((field: any) => {
			return !dd_displayNameToExclude.includes(field.dd_displayName);
		})
		.forEach((field: any) => {
			if (get_KindsArray(field).includes('ENUM')) {
				enumFields.push({ ...getRootTypeHelper(field.dd_rootName), ...field } as any);
			} else if (get_KindsArray(field).includes('SCALAR')) {
				scalarFields.push(field);
			} else {
				non_scalarFields.push(field);
			}
		});

	return {
		scalarFields,
		non_scalarFields,
		enumFields
	};
};

//colData must become colInfo everywhere,for less ambiguity
export const getStepsOfFieldsForDataGetter = (
	colInfo: TableColumnData,
	stepsOfFieldsInput?: string[]
): string[] => {
	const stepsOfFieldsOBJ = colInfo?.stepsOfFieldsOBJ;
	const stepsOfFields = colInfo?.stepsOfFields;
	const stepsOfFieldsForDataGetter = colInfo?.stepsOfFieldsForDataGetter;

	if (stepsOfFieldsInput) {
		return stepsOfFieldsInput;
	}
	if (stepsOfFieldsForDataGetter) {
		return stepsOfFieldsForDataGetter;
	}
	if (stepsOfFields) {
		return stepsOfFields;
	}
	if (stepsOfFieldsOBJ) {
		//!!!change this like so:
		//here stringify and look for the first time there is a ",",this way you know there the object bifurcates into multiple paths and so,just before that is the farthest common step to all stepsOfFields
		//temporary solution:
		return [];
	}
	return [];
};

/**
 * Traverses a result object using a path of field names (steps) to retrieve a nested value.
 * Handles arrays by mapping over them or taking the first element depending on context.
 * @param colInfo - Column metadata containing the path (stepsOfFields).
 * @param row_resultData - The data object to traverse.
 * @param stepsOfFieldsInput - Optional override for the path.
 * @returns The value found at the end of the path.
 */
export const getDataGivenStepsOfFields = (
	colInfo: TableColumnData | undefined,
	row_resultData: unknown,
	stepsOfFieldsInput?: string[]
): unknown => {
	//col data is column info like colInfo.stepsOfFields,not the result's column data

	const stepsOfFields = colInfo
		? getStepsOfFieldsForDataGetter(colInfo, stepsOfFieldsInput)
		: stepsOfFieldsInput || [];
	if (stepsOfFields.length == 0) {
		return row_resultData;
	}

	const handleStep = (step: string, colResultData: unknown): unknown => {
		//!!! there must be some changes made here because undefined == null (but typeof undefined !== null)
		//colResultData is undefined
		if (colResultData == undefined && row_resultData == null) {
			return null;
		}
		if (colResultData == undefined && Array.isArray(row_resultData)) {
			return (row_resultData as any[])[0];
		}
		if (colResultData !== undefined && colResultData == null) {
			return null;
		}
		if (colResultData == undefined && (row_resultData as any)?.[step] !== undefined) {
			//!!! this must be changed  colResultData == undefined must become typeof colResultData == undefined,for now this change causes some problems,dig deeper next time
			return (row_resultData as any)[step];
		}
		if (colResultData == undefined) {
			return row_resultData;
		}

		//colResultData is defined

		if (colResultData == null) {
			return null;
		}

		if (Array.isArray(colResultData)) {
			//!!!colResultData?.[0] in most cases is fine,but if needs be make a map,as to handle all elements of the array not only one.for count for example is perfect this way of handling,count is present only once.
			if (colResultData && colResultData?.length == 0 && colResultData?.[0]?.[step] !== undefined) {
				return colResultData[0][step];
			}
			//!!!the bellow is not perfect,but always works,only that it doesn't go so deep.Keep it as deep though else performance mmight get hurt
			if (colResultData && colResultData?.length > 0 && colResultData?.[0]?.[step] !== undefined) {
				return colResultData.map((element) => {
					return handleStep(step, element?.[step]);
					//return element?.[step]
				});
			}
		}

		if (colResultData && (colResultData as any)?.[step] !== undefined) {
			return (colResultData as any)[step];
		}
		return colResultData;
	};
	let colResultData: unknown;
	stepsOfFields.every((step) => {
		colResultData = handleStep(step, colResultData);
		return true;
	});

	return colResultData;
};

export const getTableCellData = (
	rowData: unknown,
	colData: TableColumnData,
	index: number
): unknown => {
	let data;
	if (rowData) {
		if ((rowData as any)[index] !== undefined) {
			//rowData[index] //Not good,causes problems when two or more fields share fields,because in the results they will have data under the same column
			data = getDataGivenStepsOfFields(colData, (rowData as any)[index]);
		} else {
			data = getDataGivenStepsOfFields(colData, rowData);
		}
	} else {
		data = 'loading...';
	}

	return data;
};

export const formatData = (
	data: unknown = '',
	length: number,
	alwaysStringyfy = true
): string => {
	let string = '';
	let resultingString = '';

	if (alwaysStringyfy) {
		string = JSON.stringify(data);
	} else {
		typeof data === 'string' ? (string = data) : (string = JSON.stringify(data));
	}

	if (string.length >= length) {
		resultingString = `${string.substring(0, length / 2)} ... ${string.substring(
			string.length - length / 2
		)}`;
	} else {
		resultingString = string;
	}

	return resultingString;
};

export const sortByName = <T extends { name?: string }>(array: T[]): T[] => {
	array?.sort((a, b) => {
		if ((a?.name || '') < (b?.name || '')) {
			return -1;
		}
		if ((a?.name || '') > (b?.name || '')) {
			return 1;
		}
		return 0;
	});

	return array;
};

export const get_displayInterface = (
	typeInfo: Partial<FieldWithDerivedData>,
	endpointInfo: EndpointInfoStore
): string | null => {
	if (endpointInfo.get_typeExtraData(typeInfo)) {
		return endpointInfo.get_typeExtraData(typeInfo)?.displayInterface || null;
	}
	return null;
};

export const mark_paginationArgs = (
	args: FieldWithDerivedData[],
	endpointInfo: EndpointInfoStore
): void => {
	const paginationPossibleNames = get(endpointInfo).paginationArgsPossibleNames;
	if (!paginationPossibleNames) return;
	const paginationPossibleNamesKeys = Object.keys(paginationPossibleNames);
	args.forEach((arg) => {
		const matchingKey = paginationPossibleNamesKeys.find((key) => {
			return paginationPossibleNames[key].includes(arg.dd_displayName);
		});
		if (matchingKey) {
			arg.dd_isPaginationArg = true;
			arg.dd_standsFor = matchingKey;
		} else {
			arg.dd_isPaginationArg = false;
		}
	});
};

export const get_paginationType = (
	paginationArgs: FieldWithDerivedData[],
	endpointInfo: EndpointInfoStore,
	schemaData: SchemaDataStore | SchemaData
): string => {
	const standsForArray = paginationArgs.map((arg) => {
		return arg.dd_standsFor || '';
	});
	const paginationType = get_paginationTypes(endpointInfo, schemaData).find((paginationType) => {
		return paginationType.check(standsForArray);
	})?.name;
	if (paginationType) {
		return paginationType;
	}
	return 'unknown';
};

/**
 * Generates derived data for a field, enriching it with useful metadata for the UI.
 * @param type - The original field/type data.
 * @param rootTypes - List of root types.
 * @param isQMSField - Whether it is a top-level QMS field.
 * @param endpointInfo - Endpoint configuration.
 * @param schemaData - Schema data store or value.
 * @returns The enriched FieldWithDerivedData.
 */
export const generate_derivedData = (
	type: Partial<FieldWithDerivedData>,
	rootTypes: RootType[] | null,
	isQMSField: boolean,
	endpointInfo: EndpointInfoStore,
	schemaData: SchemaDataStore | SchemaData
): FieldWithDerivedData => {
	//type/field
	const derivedData: FieldWithDerivedData = { ...type } as FieldWithDerivedData;
	derivedData.dd_kindsArray = get_KindsArray(type);
	derivedData.dd_namesArray = get_NamesArray(type);
	derivedData.dd_rootName = get_rootName(derivedData.dd_namesArray);
	derivedData.dd_displayName = get_displayName(derivedData.dd_namesArray);
	derivedData.dd_relatedRoot = getRootType(rootTypes, derivedData.dd_rootName, schemaData) || '';

	derivedData.dd_kindEl = undefined;
	derivedData.dd_kindEl_NON_NULL = false;
	derivedData.dd_kindList = false;
	derivedData.dd_kindList_NON_NULL = false;
	derivedData.dd_NON_NULL = derivedData.dd_kindsArray[0] === 'NON_NULL';

	const dd_kindsArray_REVERSE = [...derivedData.dd_kindsArray].reverse();
	dd_kindsArray_REVERSE.forEach((el) => {
		if (el == 'LIST') {
			derivedData.dd_kindList = true;
		} else if (el == 'NON_NULL') {
			if (derivedData.dd_kindList) {
				derivedData.dd_kindList_NON_NULL = true;
			} else {
				derivedData.dd_kindEl_NON_NULL = true;
			}
		} else {
			derivedData.dd_kindEl = el;
		}
	});

	const displayInterface = get_displayInterface(derivedData, endpointInfo) as any;

	if (['text', undefined].includes(derivedData.dd_displayInterface as any)) {
		derivedData.dd_displayInterface = displayInterface;
	}

	derivedData.dd_isArg = !type?.args;
	derivedData.dd_relatedRoot_inputFields_allScalar = (
		derivedData.dd_relatedRoot as RootType
	)?.inputFields?.every((field) => {
		return get_KindsArray(field).includes('SCALAR');
	});
	derivedData.dd_canExpand =
		!derivedData.dd_kindsArray?.includes('SCALAR') && derivedData.dd_kindsArray.length > 0;
	if (derivedData.dd_isArg) {
		const baseFilterOperatorNames = ['_and', '_or', '_not', 'and', 'or', 'not'];
		let dd_baseFilterOperators: string[] | undefined = [];
		let dd_nonBaseFilterOperators: string[] | undefined = [];
		if ((type as any)?.inputFields) {
			(type as any).inputFields.forEach((inputField: any) => {
				if (baseFilterOperatorNames.includes(inputField.name)) {
					dd_baseFilterOperators?.push(inputField.name);
					return inputField.name;
				}
				if (inputField.name.startsWith('_')) {
					dd_nonBaseFilterOperators?.push(inputField.name);
				}
			});

			if (!(dd_baseFilterOperators?.length > 0)) {
				dd_baseFilterOperators = undefined;
			}
			if (!(dd_nonBaseFilterOperators?.length > 0)) {
				dd_nonBaseFilterOperators = undefined;
			}
			derivedData.dd_baseFilterOperators = dd_baseFilterOperators;
			derivedData.dd_nonBaseFilterOperators = dd_nonBaseFilterOperators;
		}

		derivedData.dd_isRootArg = !(
			derivedData.dd_canExpand && !(derivedData?.dd_relatedRoot as RootType)?.enumValues
		);
	}

	derivedData.dd_shouldExpand =
		derivedData.dd_canExpand && !(derivedData.dd_relatedRoot as RootType)?.enumValues;
	derivedData.dd_isQMSField = isQMSField ? true : false;

	derivedData.dd_castType = 'implement this.possible values:string,number,graphqlGeoJson...'; //example of why:date can be expected as timestamptz ("2016-07-20T17:30:15+05:30"),but must be casted as string
	derivedData.dd_derivedTypeBorrowed = 'implement this? maybe not?';
	////////// others
	if (derivedData?.dd_baseFilterOperators) {
		const defaultdisplayInterface = get_displayInterface(derivedData, endpointInfo);
		if ((type as any)?.inputFields !== undefined) {
			(type as any).inputFields.forEach((inputField: any) => {
				Object.assign(inputField, { dd_displayInterface: defaultdisplayInterface });
			});
		}
	}
	if (derivedData.args) {
		mark_paginationArgs(derivedData.args as any, endpointInfo);
		derivedData.dd_paginationArgs = (derivedData.args as any).filter((arg: any) => {
			return arg.dd_isPaginationArg;
		});
		derivedData.dd_paginationType = get_paginationType(
			derivedData.dd_paginationArgs,
			endpointInfo,
			schemaData
		);
	}
	derivedData.dd_relatedRoot =
		'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON';

	if (isQMSField) {
		//derivedData.dd_tableName = endpointInfo.get_tableName(derivedData, schemaData)
	}
	//	derivedData.dd_StrForFuseComparison = `${derivedData.dd_displayName}  ${derivedData.dd_rootName} ${derivedData.description}`
	//${derivedData.dd_displayName}  ${derivedData.dd_rootName} ${derivedData.description}
	derivedData.dd_StrForFuseComparison = `${prepareStrForFuseComparison(`${derivedData.dd_displayName}   `)} `;
	//console.log(derivedData.dd_StrForFuseComparison)
	return derivedData;
};
const prepareStrForFuseComparison = (str: string): string => {
	return str
		.replace(/(?=[A-Z_])/g, ' ')
		.replace(/_/g, ' ')
		.replace(/s|null/g, '')
		.toLowerCase();
};

export const generate_gqlArgObj = (group_argumentsData: ActiveArgumentData[]): GQLArgObj => {
	// check for group if expects list and treat it accordingly like here --->https://stackoverflow.com/questions/69040911/hasura-order-by-date-with-distinct
	const gqlArgObj: Record<string, any> = {};
	let canRunQuery = true;
	group_argumentsData.every((argData) => {
		const _argumentCanRunQuery = argumentCanRunQuery(argData);
		if (!_argumentCanRunQuery) {
			canRunQuery = false;
			return false;
		}
		const { chd_dispatchValue, stepsOfFields, dd_displayName } = argData;

		const curr_gqlArgObj = gqlArgObj;
		curr_gqlArgObj[dd_displayName] = chd_dispatchValue;
	});

	return {
		arg_gqlArgObj: gqlArgObj,
		arg_canRunQuery: canRunQuery,
		gqlArgObj,
		canRunQuery,
		note: 'these are repeated for easy refactoring while keeping the old working: arg_gqlArgObj: gqlArgObj, arg_canRunQuery: canRunQuery, gqlArgObj,canRunQuery'
	};
};

export const gqlArgObjToString = (gqlArgObj: Record<string, unknown>): string => {
	const gqlArgObj_string = JSON.stringify(gqlArgObj);
	if (gqlArgObj_string == '{ }') {
		return '';
	}
	const gqlArgObj_stringModified = gqlArgObj_string
		.replace(/"/g, '')
		.replace(/'/g, `"`)
		.replace(/&Prime;/g, `\\"`)
		.replace(/&prime;/g, `'`)
		.slice(1, -1);
	return gqlArgObj_stringModified;
};
export const generate_group_gqlArgObjForRoot = (
	group_argumentsData: ActiveArgumentData[]
): Record<string, unknown> => {
	return _.merge(
		{},
		...group_argumentsData.map((arggumentData) => {
			return arggumentData.gqlArgObj;
		})
	);
};
export const generate_group_gqlArgObj = (
	group: ActiveArgumentGroup
): {
	group_gqlArgObj: Record<string, unknown>;
	group_gqlArgObj_string: string;
	group_canRunQuery: boolean;
} => {
	//if is where/filter (its related_root has filter_operators  ,like __or,__and,_not) handle differently after implementing the new ui
	let group_gqlArgObj = {};

	const group_argumentsData = group.group_args.filter((arg) => {
		return arg.inUse;
	});
	const group_canRunQuery = group_argumentsData.every((arg) => {
		return arg.canRunQuery;
	});
	if (group_argumentsData?.length > 0) {
		if (group.group_isRoot) {
			//console.log('root group handled');
			group_gqlArgObj = generate_group_gqlArgObjForRoot(group_argumentsData);
			Logger.debug({ group_gqlArgObj, group_argumentsData });
		} else {
			Logger.error('Uncomment code for handling non root group');
			// //console.log('NON root group handled');
			// if (group.dd_kindList) {
			// 	let list = [];
			// 	list = group_argumentsData.map((arg) => {
			// 		let { gqlArgObj } = generate_gqlArgObj([arg]);

			// 		return gqlArgObj[group.group_name];
			// 	});
			// 	group_gqlArgObj[group.group_name] = list;
			// 	group_gqlArgObj = { ...group_gqlArgObj };
			// 	//console.log('list---', list);
			// } else {
			// 	let { gqlArgObj } = generate_gqlArgObj(group_argumentsData);
			// 	group_gqlArgObj = { ...group_gqlArgObj, ...gqlArgObj };
			// }
		}
	}

	const group_gqlArgObj_string = gqlArgObjToString(group_gqlArgObj);
	return {
		group_gqlArgObj,
		group_gqlArgObj_string,
		group_canRunQuery
	};
};

const validItems = (
	items: { id: string }[],
	nodes: Record<string, ContainerData>
): { id: string }[] => {
	return items.filter((item) => {
		const itemData = nodes[item.id];
		Logger.debug('itemData.selectedRowsColValues', itemData.selectedRowsColValues);
		return (
			itemData.inUse ||
			(itemData.operator && validItems(itemData.items, nodes).length > 0) ||
			itemData.selectedRowsColValues
		);
	});
};

//
export const filterElFromArr = <T>(arr: T[], undesiredElements: T[] = []): T[] => {
	return arr.filter((el) => {
		return !undesiredElements.includes(el);
	});
};

export const generate_group_gqlArgObj_forHasOperators = (
	items: { id: string }[],
	group_name: string,
	nodes: Record<string, ContainerData>
): {
	resultingGqlArgObj: Record<string, unknown> | undefined;
	itemsResultingData: Record<string, unknown>[];
} => {
	let resultingGqlArgObj: Record<string, unknown> | undefined;
	const itemsResultingData: Record<string, unknown>[] = [];
	const spreadItemsIfInSpreadContainers = (items: { id: string }[]): { id: string }[] => {
		const spreadOutItems: { id: string }[] = [];
		items.forEach((item) => {
			if (nodes[item.id]?.operator == '~spread~') {
				const validItemsResult = validItems(nodes[item.id].items, nodes);
				spreadOutItems.push(...validItemsResult);
			} else {
				spreadOutItems.push(item);
			}
		});
		return spreadOutItems;
	};

	const spreadOutItems = spreadItemsIfInSpreadContainers(items);
	Logger.debug({ items, spreadOutItems });
	spreadOutItems.forEach((item) => {
		const itemData = nodes[item.id];
		const isContainer = itemData.hasOwnProperty('items');
		const nodeStep = itemData?.stepsOfNodes?.[(itemData?.stepsOfNodes?.length || 0) - 1] as any;
		const nodeStepClean = filterElFromArr(nodeStep, [null, undefined, 'bonded', 'list']);
		Logger.debug({ nodeStep }, { nodeStepClean });

		const operator = itemData.operator;
		let itemObj = {};
		let itemObjCurr: any = itemObj;
		const displayName = itemData?.dd_displayName;
		let dataToAssign;

		if (isContainer) {
			const validItemsResult = validItems(spreadItemsIfInSpreadContainers(itemData.items), nodes);
			const gqlArgObjForItems = generate_group_gqlArgObj_forHasOperators(
				validItemsResult,
				group_name,
				nodes
			).itemsResultingData;
			if (operator == 'bonded' || !itemData?.dd_kindList) {
				const merged_gqlArgObjForItems = _.merge({}, ...gqlArgObjForItems);
				dataToAssign = merged_gqlArgObjForItems;
			} else {
				dataToAssign = gqlArgObjForItems;
			}
			Logger.debug('vvvvvvv', { gqlArgObjForItems, dataToAssign });
		} else {
			dataToAssign = nodes[item.id]?.gqlArgObj;
		}
		if (itemData.selectedRowsColValues) {
			if (Array.isArray(dataToAssign)) {
				dataToAssign = [...itemData.selectedRowsColValues, ...dataToAssign];
			} else {
				dataToAssign = _.merge({}, itemData.selectedRowsColValues[0], dataToAssign);
			}
		}
		resultingGqlArgObj = setValueAtPath({}, nodeStepClean, dataToAssign, true) || undefined;
		let itemObjectTestCurr = setValueAtPath({}, nodeStepClean, dataToAssign, true);
		const itemObjectTest2 = 'not set';
		if (resultingGqlArgObj == undefined) {
			const itemObjectTest2 = 'set';
			//itemObjectTest2 = dataToAssign
			resultingGqlArgObj = dataToAssign as any;
			itemObjectTestCurr = dataToAssign as any;
		}

		if (isContainer) {
			if (itemData.not) {
				itemObjCurr['_not'] = displayName ? {} : dataToAssign;
				itemObjCurr = itemObjCurr['_not'];
			}
			if (displayName) {
				itemObjCurr[displayName] = dataToAssign;
				itemObjCurr = itemObjCurr[displayName];
			} else {
				itemObjCurr = _.merge(itemObjCurr, dataToAssign);
			}
		}

		if (!isContainer && displayName) {
			if (itemData.not) {
				itemObjCurr['_not'] = dataToAssign;
				itemObjCurr = itemObjCurr['_not'];
			} else {
				itemObj = dataToAssign as any;
			}
		}

		Logger.debug('itemsResultingData loop', {
			nodeStepClean,
			itemObj,
			resultingGqlArgObj,
			itemObjectTest2,
			itemObjectTestCurr,
			dataToAssign,
			selectedRowsColValues: itemData.selectedRowsColValues
		});

		itemsResultingData.push(itemObj);

		Logger.debug({ itemsResultingData, dataToAssign, itemData });
	});
	return {
		resultingGqlArgObj,
		itemsResultingData
	};
};

export const generate_group_gqlArgObjAndCanRunQuery_forHasOperators = (
	group: ActiveArgumentGroup
): {
	group_gqlArgObj: Record<string, unknown> | undefined;
	group_gqlArgObj_string: string;
	group_canRunQuery: boolean;
} => {
	const { group_argsNode, group_name, group_hasAllArgs } = group;

	let group_canRunQuery = true;
	const nodes = JSON.parse(JSON.stringify(group_argsNode));
	const nodesArray: any[] = Object.values(nodes);
	const mainContainer = nodesArray.filter((node) => {
		return node.isMain;
	})[0];

	const generate_group_gqlArgObj_forHasOperatorsRESULT = generate_group_gqlArgObj_forHasOperators(
		[mainContainer],
		group_name,
		nodes
	);
	Logger.debug({ generate_group_gqlArgObj_forHasOperatorsRESULT });

	const group_argumentsData = group.group_args.filter((arg) => {
		return arg.inUse;
	});
	group_canRunQuery = group_argumentsData.every((arg) => {
		return arg.canRunQuery;
	});
	let group_gqlArgObj;
	if (group_hasAllArgs) {
		group_gqlArgObj = (generate_group_gqlArgObj_forHasOperatorsRESULT.resultingGqlArgObj as any)?.[
			mainContainer.dd_displayName
		];
	} else {
		group_gqlArgObj = generate_group_gqlArgObj_forHasOperatorsRESULT.resultingGqlArgObj;
	}
	const group_gqlArgObj_string = gqlArgObjToString(group_gqlArgObj || {});
	return {
		group_gqlArgObj,
		group_gqlArgObj_string,
		group_canRunQuery
	};
};
////

export const generate_finalGqlArgObj_fromGroups = (
	activeArgumentsDataGrouped: {
		group_gqlArgObj?: Record<string, unknown>;
		group_canRunQuery?: boolean;
	}[]
): FinalGQLArgObj => {
	const finalGqlArgObj = {};
	const final_canRunQuery = activeArgumentsDataGrouped.every((group) => {
		return group.group_canRunQuery;
	});

	activeArgumentsDataGrouped.forEach((group) => {
		Logger.debug({ group });
		Object.assign(finalGqlArgObj, group.group_gqlArgObj);
	});

	return { finalGqlArgObj, final_canRunQuery };
};

export const getQMSLinks = (
	QMSName: QMSType = 'query',
	parentURL: string,
	endpointInfo: EndpointInfoStore,
	schemaData: SchemaDataStore
): { url: string; title: string }[] => {
	const $page = get(page);
	const origin = $page.url.origin;
	let queryLinks: { url: string; title: string }[] = [];
	const $schemaData = get(schemaData);
	const sortIt = (QMSFields: FieldWithDerivedData[]): FieldWithDerivedData[] => {
		return [...(QMSFields || [])]?.sort((a, b) => {
			const ea = a.dd_rootName;
			const eb = b.dd_rootName;
			const fa = a.dd_displayName.substring(6);
			const fb = b.dd_displayName.substring(6);
			const ga = a.dd_displayName;
			const gb = b.dd_displayName;
			return sortingFunctionMutipleColumnsGivenArray([
				[ea, eb],
				[fa, fb],
				[ga, gb]
			]);
		});
	};

	queryLinks = sortIt(($schemaData as any)?.[`${QMSName}Fields`] as FieldWithDerivedData[])?.map(
		(query) => {
			const queryName = query.name;
			let queryNameDisplay = queryName;
			const queryTitleDisplay = '';
			const currentQueryFromRootTypes = getRootType(null, query.dd_rootName, schemaData);
			const currentQMS_info = get_QMS_Field(queryName, QMSName, schemaData);
			const endpointInfoVal = get(endpointInfo);
			const rowsLocation = endpointInfo.get_rowsLocation(
				currentQMS_info as FieldWithDerivedData,
				schemaData
			);
			const nodeFieldsQMS_info = get_nodeFieldsQMS_info(
				currentQMS_info as FieldWithDerivedData,
				rowsLocation,
				schemaData
			);
			const scalarFields = get_scalarColsData(
				nodeFieldsQMS_info,
				[(currentQMS_info as FieldWithDerivedData).dd_displayName, ...rowsLocation],
				schemaData
			);

			const currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
				return field.title; // title used to be name? get_scalarColsData returns TableColumnData which has title
			});

			const mandatoryArgs = query?.args?.filter((arg) => {
				return arg.dd_NON_NULL;
			});
			const ID_Args = query?.args?.filter((arg) => {
				return arg.dd_rootName == 'ID';
			});
			if (mandatoryArgs?.length > 0) {
				queryNameDisplay = `${queryNameDisplay} (${mandatoryArgs.length}) `;
			}
			if (ID_Args?.length > 0) {
				queryNameDisplay = `${queryNameDisplay} <${ID_Args.length}> `;
			}
			if (scalarFields.length == 0) {
				queryNameDisplay = queryNameDisplay + ' (no scalar)';
			}
			const queryLink = { url: `${parentURL}/${queryName}`, title: queryNameDisplay };
			return queryLink;
		}
	);
	return queryLinks;
};

////////////////////////

export const stepsOfFieldsToQueryFragmentObject = (
	stepsOfFields: string[],
	excludeFirstStep = true,
	dataForLastStep = 'novaluehere'
): StepsOfFieldsObject => {
	const _stepsOfFields = [...stepsOfFields];
	if (excludeFirstStep) {
		_stepsOfFields.shift();
	}
	const _stepsOfFields_length = _stepsOfFields.length;
	const queryObject: any = {};
	let queryObjectCurrLevel = queryObject;
	_stepsOfFields.forEach((fieldName, index) => {
		if (_stepsOfFields_length == index + 1) {
			queryObjectCurrLevel[fieldName] = dataForLastStep;
		} else {
			queryObjectCurrLevel[fieldName] = {};
			queryObjectCurrLevel = queryObjectCurrLevel[fieldName];
		}
	});
	return queryObject;
};

export const tableColsDataToQueryFields = (
	tableColsData: TableColumnData[]
): StepsOfFieldsObject | string => {
	if (tableColsData.length == 0) {
		return ``;
	}
	const queryFragmentsObjects = tableColsData
		.filter((colData) => {
			return colData.stepsOfFieldsOBJ !== undefined;
		})
		.map((colData) => {
			return colData.stepsOfFieldsOBJ;
		});
	const _queryFragmentsObjects = JSON.parse(JSON.stringify(queryFragmentsObjects));

	const merged = _.merge({}, ..._queryFragmentsObjects);
	//const stringified = JSON.stringify(merged);
	//const queryFragments = stringified.replaceAll(/novaluehere|"|:/gi, '').slice(1, -1);
	return merged;
};

export const argumentCanRunQuery = (arg: ActiveArgumentData): boolean => {
	const {
		inUse,
		chd_chosen,
		chd_dispatchValue,
		dd_kindEl,
		dd_kindEl_NON_NULL,
		dd_kindList,
		dd_kindList_NON_NULL
	} = arg;
	Logger.debug('argumentCanRunQuery', { arg });
	const argFinalValue = chd_dispatchValue;
	if (!inUse) {
		return true;
	}
	if (dd_kindList && !Array.isArray(argFinalValue)) {
		return false;
	}
	if (dd_kindList_NON_NULL && argFinalValue == null) {
		return false;
	}
	if (
		dd_kindEl &&
		(argFinalValue == undefined || (Array.isArray(argFinalValue) && argFinalValue.length == 0))
	) {
		return false;
	}
	if (chd_dispatchValue == undefined) {
		return false;
	}
	return true;
};

//////

export const generateNewArgData = (
	stepsOfFields: string[],
	type: Partial<FieldWithDerivedData>,
	extraData: Record<string, unknown> = {}
): ActiveArgumentData => {
	const infoToCast = {
		stepsOfFields,
		stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
		id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
		...type,
		...extraData
	} as ActiveArgumentData;
	return infoToCast;
};

export const get_scalarColsData = (
	currentQMS_info: FieldWithDerivedData | null | undefined,
	prefixStepsOfFields: string[] = [],
	schemaData: SchemaDataStore | SchemaData
): TableColumnData[] => {
	if (!currentQMS_info) {
		return [];
	}
	let keep_currentQMS_info_dd_displayName = true;
	if (prefixStepsOfFields.length > 0) {
		keep_currentQMS_info_dd_displayName = false;
	}
	const dd_relatedRoot = getRootType(null, currentQMS_info.dd_rootName, schemaData);
	const { scalarFields } = getFields_Grouped(dd_relatedRoot as RootType, [], schemaData);
	const currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
		return field.name;
	});
	//console.log('qqqq', { dd_relatedRoot, scalarFields, currentQuery_fields_SCALAR_names })
	const scalarColsData = currentQuery_fields_SCALAR_names.map((name) => {
		let stepsOfFields;
		if (keep_currentQMS_info_dd_displayName) {
			stepsOfFields = [...prefixStepsOfFields, currentQMS_info!.dd_displayName, name];
		} else {
			stepsOfFields = [...prefixStepsOfFields, name];
		}

		const scalarColData = {
			title: name,
			stepsOfFields: stepsOfFields,
			stepsOfFieldsOBJ: stepsOfFieldsToQueryFragmentObject(stepsOfFields, false)
		};
		return scalarColData;
	});
	return scalarColsData;
};

export const get_nodeFieldsQMS_info = (
	QMS_info: FieldWithDerivedData,
	rowsLocation: string[],
	schemaData: SchemaDataStore | SchemaData
): FieldWithDerivedData | undefined => {
	if (rowsLocation?.length == 0) {
		return QMS_info;
	}

	let nodeFieldsQMS_info: FieldWithDerivedData | undefined = QMS_info;
	if (!getRootType(null, nodeFieldsQMS_info?.dd_rootName, schemaData)?.fields) {
		return undefined;
	}

	for (const curr_rowsLocation of rowsLocation) {
		if (!nodeFieldsQMS_info?.dd_rootName) {
			return undefined;
		}
		const rootType = getRootType(null, nodeFieldsQMS_info.dd_rootName, schemaData);
		if (!rootType?.fields) {
			return undefined;
		}
		nodeFieldsQMS_info = rootType.fields.find((field) => {
			return field.dd_displayName == curr_rowsLocation;
		});

		if (!nodeFieldsQMS_info) {
			return undefined;
		}
	}

	return nodeFieldsQMS_info;
};

/**
 * Verifies that a path of fields (stepsOfFields) exists in the schema.
 * @param stepsOfFields - The path of field names.
 * @param schemaData - The schema data.
 * @returns The field definition of the last step if valid, otherwise throws an error.
 */
export const check_stepsOfFields = (
	stepsOfFields: string[],
	schemaData: SchemaDataStore | SchemaData
): FieldWithDerivedData | undefined => {
	if (!stepsOfFields || stepsOfFields.length === 0) return undefined;

	const rootFieldName = stepsOfFields[0];
	let rootField = get_QMS_Field(rootFieldName, 'query', schemaData);

	if (!rootField) {
		rootField = get_QMS_Field(rootFieldName, 'mutation', schemaData);
	}
	if (!rootField) {
		rootField = get_QMS_Field(rootFieldName, 'subscription', schemaData);
	}

	if (!rootField) {
		throw new Error(`Root field '${rootFieldName}' not found in schema.`);
	}

	if (stepsOfFields.length === 1) return rootField;

	const remainingSteps = stepsOfFields.slice(1);
	let currentField = rootField;

	for (let i = 0; i < remainingSteps.length; i++) {
		const stepName = remainingSteps[i];

		const currentType = getRootType(null, currentField.dd_rootName, schemaData);

		if (!currentType) {
			throw new Error(
				`Type '${currentField.dd_rootName}' for field '${currentField.dd_displayName}' not found in schema.`
			);
		}

		const nextField = currentType.fields?.find((f) => f.dd_displayName === stepName);

		if (!nextField) {
			throw new Error(
				`Field '${stepName}' not found in type '${currentType.name}' (field path: ${stepsOfFields.slice(0, i + 2).join(' -> ')}).`
			);
		}

		currentField = nextField;
	}

	return currentField;
};

/**
 * Generates a concise title from a list of field steps, abbreviating intermediate steps.
 * @param stepsOfFields - The array of field names.
 * @returns A string representation of the path.
 */
export const generateTitleFromStepsOfFields = (stepsOfFields: string[]): string => {
	const title = stepsOfFields.map((step, index) => {
		if (stepsOfFields.length - index - 1 == 0) {
			return `${step}`;
		}
		return `${step.slice(0, 4)}>`;
	});
	title.shift();
	return title.join('');
};

/**
 * Compare function for sorting based on multiple columns/criteria.
 * @param array - An array of tuples, where each tuple contains values to compare [valA, valB].
 * @returns -1 if A < B, 1 if A > B, or 0 if equal.
 */
export const sortingFunctionMutipleColumnsGivenArray = (array: [unknown, unknown][]): number => {
	const maxIndex = array.length - 1;
	const check = (currentIndex: number): number => {
		const column = array[currentIndex];
		if (column[0] < column[1]) {
			return -1;
		}
		if (column[0] > column[1]) {
			return 1;
		}
		if (currentIndex + 1 <= maxIndex) {
			return check(currentIndex + 1);
		}
		return 0;
	};
	return check(0);
};

export const nodeAddDefaultFields = (
	node: ContainerData,
	prefix = '',
	group: ActiveArgumentGroup,
	activeArgumentsDataGrouped_Store: ActiveArgumentsDataGroupedStore,
	schemaData: SchemaDataStore | SchemaData,
	endpointInfo: EndpointInfoStore
): void => {
	Logger.debug({ node });
	const node_rootType = getRootType(
		null,
		node?.dd_rootName || node.parent_node?.dd_rootName,
		schemaData
	);
	Logger.debug({ node_rootType });
	const group_argsNode = group.group_argsNode;

	const dd_displayNameToExclude = [
		...node.items.map((item) => {
			return group_argsNode?.[item.id]?.dd_displayName;
		}),
		'_and',
		'_or',
		'_not',
		'and',
		'or',
		'not'
	];
	Logger.debug({ dd_displayNameToExclude });

	const fields_Grouped = getFields_Grouped(node, dd_displayNameToExclude, schemaData);
	const scalarFields = fields_Grouped.scalarFields;
	const non_scalarFields = fields_Grouped.non_scalarFields;
	const enumFields = fields_Grouped.enumFields;

	Logger.debug({ group, node, node_rootType, dd_displayNameToExclude, fields_Grouped });

	Logger.debug({ scalarFields });
	Logger.debug({ enumFields });

	[...scalarFields, ...enumFields].forEach((element) => {
		const stepsOfFields = [
			group.group_name || node.dd_displayName || node.parent_node?.dd_displayName,
			element.dd_displayName
		];
		const newArgData = {
			stepsOfFields,
			stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
			id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
			...element
		};
		activeArgumentsDataGrouped_Store.add_activeArgument(
			newArgData as any,
			group.group_name,
			node?.id,
			endpointInfo
		);
	});

	const baseFilterOperators = ['_and', '_or', '_not', 'and', 'or', 'not']; //!!!this might create problem if there is some nonBase operator with the same name as one of these

	non_scalarFields
		?.filter((arg) => {
			return !baseFilterOperators.includes(arg.dd_displayName);
		})
		?.forEach((element) => {
			const stepsOfFields = [
				group.group_name || node.dd_displayName || node.parent_node?.dd_displayName,
				element.dd_displayName
			];
			// if (stepsOfFields[stepsOfFields.length - 1] !== element.dd_displayName) {
			// 	stepsOfFields.push(element.dd_displayName); //take care might caus eproblems
			// }

			const newContainerData = {
				stepsOfFields,
				stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
				id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
				...element
			};
			Logger.debug({ newContainerData });
			const randomNr = Math.random();
			Logger.debug('group', group);
			const newContainerDataRootType = getRootType(null, newContainerData.dd_rootName, schemaData);
			const hasBaseFilterOperators = newContainerDataRootType?.dd_baseFilterOperators;
			const NODEhasBaseFilterOperators = getRootType(
				null,
				node.dd_rootName,
				schemaData
			)?.dd_baseFilterOperators;
			const hasNonBaseFilterOperators = newContainerDataRootType?.dd_nonBaseFilterOperators;

			const isListContainer = newContainerData?.dd_kindList;
			let operator;
			if (!operator && isListContainer) {
				operator = 'list';
			}

			// if (!operator && hasBaseFilterOperators && node.dd_rootName && !NODEhasBaseFilterOperators) {
			// 	operator = '_and';
			// }

			if (!operator) {
				operator = 'bonded';
			}

			if (group.group_argsNode) {
				group.group_argsNode[`${randomNr}`] = {
					items: [],
					...newContainerData,
					inputFields: newContainerDataRootType?.inputFields,
					id: `${randomNr}`,
					operator,
					not: false,
					isMain: false
				} as any;
			}
			Logger.debug({ newContainerDataRootType });
			Logger.debug({ newContainerData });
			if (node?.items) {
				node.items.push({ id: `${randomNr}` });
			} else if (group.group_argsNode) {
				group.group_argsNode['mainContainer'].items.push({ id: `${randomNr}` });
			}
		});
	activeArgumentsDataGrouped_Store.update((data) => {
		return data;
	}); //force update

	node.addDefaultFields = false; // Note: addDefaultFields is not in ContainerData type, assuming it's dynamic
};

export const stigifyAll = (data: unknown): string => {
	return JSON.stringify(data, function (key, value) {
		if (typeof value === 'function') {
			return '/Function(' + value.toString() + ')/';
		}
		return value;
	});
};

export const parseAll = (json: string): unknown => {
	return JSON.parse(json, function (key, value) {
		if (typeof value === 'string' && value.startsWith('/Function(') && value.endsWith(')/')) {
			value = value.substring(10, value.length - 2);
			return (0, eval)('(' + value + ')');
		}
		return value;
	});
};

export const stringToJs = (string: unknown): unknown => {
	if (getPreciseType(string) !== 'string') {
		Logger.warn(
			`expectig string but got ${getPreciseType(string)},will use it as is.If object,you do not need this function,maybe this function was run previously.`,
			{ string }
		);
		return string;
	}
	const str = string as string;
	if (str.includes('/Function') && str.includes(')/')) {
		return parseAll(str);
	}
	return new Function(`return ${str}`)();
};

export const objectToSourceCode = (obj: Record<string, unknown>): string => {
	// Check if the input is an object
	if (typeof obj !== 'object' || obj === null) {
		throw new Error('Input must be an object');
	}

	// Helper function to convert functions to strings
	function functionToString(fn: Function): string {
		return fn.toString();
	}

	// Recursively convert the object to source code
	function convertObjectToSourceCode(obj: unknown): string {
		if (typeof obj === 'function') {
			return functionToString(obj);
		}

		if (Array.isArray(obj)) {
			return '[' + obj.map(convertObjectToSourceCode).join(', ') + ']';
		}

		if (typeof obj === 'object') {
			return (
				'{' +
				Object.entries(obj as any)
					.map(([key, value]) => {
						if (key.includes('-')) {
							key = `'${key}'`;
						}
						return `${key}: ${convertObjectToSourceCode(value)}`;
					})
					.join(', ') +
				'}'
			);
		}

		// All other types are converted to string literals
		return JSON.stringify(obj);
	}

	return convertObjectToSourceCode(obj);
};
export const hasDeepProperty = (obj: Record<string, unknown>, propertyPath: string[]): boolean => {
	let currentObj: any = obj;
	for (let i = 0; i < propertyPath.length; i++) {
		const prop = propertyPath[i];
		if (!currentObj.hasOwnProperty(prop)) {
			return false;
		}
		currentObj = currentObj[prop];
	}
	return true;
};
/**
 * Traverses the GraphQL schema structure to find a nested field definition.
 * @param obj - The starting field or type definition.
 * @param propertyPath - Array of field names representing the path.
 * @param schemaData - The schema data store or value.
 * @param fieldsType - Whether to look in 'fields' or 'inputFields'.
 * @returns The found field definition or null.
 */
export const getDeepField = (
	obj: Partial<FieldWithDerivedData>,
	propertyPath: string[],
	schemaData: SchemaDataStore | SchemaData,
	fieldsType: 'fields' | 'inputFields' = 'fields'
): FieldWithDerivedData | null => {
	//console.log({ obj, propertyPath })
	if (propertyPath.length == 0) {
		return obj as FieldWithDerivedData;
	}
	let currentObj = obj as FieldWithDerivedData;
	for (let i = 0; i < propertyPath.length; i++) {
		const prop = propertyPath[i];
		const currentObjRootType = getRootType(null, currentObj?.dd_rootName, schemaData);
		const currentObjRootTypeFields = currentObjRootType?.[fieldsType];
		const nextObj = currentObjRootTypeFields?.find((field) => {
			return field.dd_displayName == prop;
		});

		if (!nextObj) {
			return null;
		}
		currentObj = nextObj;
	}
	return currentObj;
};

export const passAllObjectValuesThroughStringTransformerAndReturnNewObject = (
	obj: Record<string, unknown>
): Record<string, unknown> => {
	//!!! to do: make this function recursive to handle nested objects and arrays

	const newObj = { ...obj };
	Object.keys(obj).forEach((key) => {
		if (typeof obj[key] == 'string') {
			newObj[key] = string_transformer(obj[key] as string);
		}
	});
	return newObj;
};

export const getValueAtPath = (obj: Record<string, unknown>, path: string[]): unknown => {
	let current: any = obj;

	for (let i = 0, len = path.length; i < len; i++) {
		current = current?.[path[i]];

		// If the current level is undefined, exit early
		if (current === undefined) {
			return undefined;
		}
	}

	return current;
};

export const getPreciseType = (value: unknown): string => {
	return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

export const deleteValueAtPath = (
	obj: Record<string, unknown>,
	path: string[]
): Record<string, unknown> | void => {
	if (!obj || !path || path.length === 0) {
		// Check for valid input
		Logger.error('Invalid input');
		return;
	}

	let currentObj: any = obj;

	for (let i = 0; i < path.length - 1; i++) {
		// Traverse the object to the specified path
		//if (currentObj?.[path[i]] === undefined) {
		if (currentObj[path[i]] === undefined) {
			// If the path does not exist, return
			Logger.error('Path does not exist');
			return;
		}
		currentObj = currentObj[path[i]];
	}

	// Delete the value at the final key in the path
	delete currentObj[path[path.length - 1]];
	return obj;
};
export const setValueAtPath = (
	obj: Record<string, unknown>,
	path: string[],
	value: unknown,
	addPathIfNotExist = true
): Record<string, unknown> | void => {
	if (!obj || !path || path.length === 0) {
		// Check for valid input
		Logger.error('Invalid input');
		return;
	}

	let currentObj: any = obj;

	for (let i = 0; i < path.length - 1; i++) {
		// Traverse the object to the specified path
		//if (currentObj?.[path[i]] === undefined) {
		if (currentObj[path[i]] === undefined) {
			if (addPathIfNotExist) {
				// If the path does not exist, add it
				Logger.info('Path does not exist,adding it');
				currentObj[path[i]] = {};
			}
			if (!addPathIfNotExist) {
				// If the path does not exist, return
				Logger.error('Path does not exist');
				return;
			}
		}
		currentObj = currentObj[path[i]];
	}

	// Set the value at the final key in the path
	currentObj[path[path.length - 1]] = value;
	return obj;
};
export const generate_finalGqlArgObjAndCanRunQuery = (
	activeArgumentsDataGrouped: ActiveArgumentGroup[],
	_paginationState_Store: PaginationStateStore | null,
	resetPaginationState = true
): FinalGQLArgObj => {
	//reset pagination state too !!!THIS MIGHT TRIGGER 1 EXTRA SERVER REQUEST,seems not from what i saw
	if (resetPaginationState && _paginationState_Store) {
		_paginationState_Store.resetToDefault();
	}
	//
	Logger.debug('regenerate_groupsAndfinalGqlArgObj RUN');
	const groups_gqlArgObj = activeArgumentsDataGrouped.map((group) => {
		if (group.group_argsNode) {
			return generate_group_gqlArgObjAndCanRunQuery_forHasOperators(group);
		} else {
			return generate_group_gqlArgObj(group);
		}
	});
	return generate_finalGqlArgObj_fromGroups(groups_gqlArgObj);
	//better set an array?
};

/**
 * Retrieves the QMSWraper context data for a given control panel item.
 * @param CPItem - The control panel item.
 * @param OutermostQMSWraperContext - The context of the outermost QMS wrapper.
 * @returns The found context data or undefined.
 */
export const getQMSWraperCtxDataGivenControlPanelItem = (
	CPItem: { stepsOfFieldsThisAppliesTo: string[] },
	OutermostQMSWraperContext: { mergedChildren_QMSWraperCtxData_Store: any }
): any => {
	const { mergedChildren_QMSWraperCtxData_Store } = OutermostQMSWraperContext;

	const mergedChildren_QMSWraperCtxData_Value = get(mergedChildren_QMSWraperCtxData_Store);

	// Assuming mergedChildren_QMSWraperCtxData_Value is an array
	if (Array.isArray(mergedChildren_QMSWraperCtxData_Value)) {
		const QMSWraperCtxData = mergedChildren_QMSWraperCtxData_Value.find((currCtx: any) => {
			return currCtx.stepsOfFields.join() == CPItem.stepsOfFieldsThisAppliesTo.join();
		});
		return QMSWraperCtxData;
	}
	return undefined;
};

/**
 * Sorts and filters a list of endpoints.
 * @param endpoints - The list of endpoints to sort.
 * @param filterOutIfNotMaintaned - Whether to filter out endpoints that are not maintained.
 * @returns The sorted (and optionally filtered) list of endpoints.
 */
export const getSortedAndOrderedEndpoints = (
	endpoints: { id: number | string; isMantained?: boolean }[],
	filterOutIfNotMaintaned = false
): { id: number | string; isMantained?: boolean }[] => {
	const sortedEndpoints = endpoints.sort((a, b) => {
		if (a.id > b.id) {
			return 1;
		}
		if (a.id < b.id) {
			return -1;
		}
		return 0;
	});
	if (!filterOutIfNotMaintaned) {
		return sortedEndpoints;
	}
	return sortedEndpoints.filter((endpoint) => {
		return endpoint.isMantained;
	});
};
