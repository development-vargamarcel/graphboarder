//QMS means QueryOrMutationOrSubscription
//TODO:
//create stepsOfFieldscheck,started,named "check_stepsOfFields"
import _ from 'lodash';
import { get } from 'svelte/store';
import { page } from '$app/stores';
import { get_paginationTypes } from '$lib/stores/pagination/paginationTypes';
import { getContext } from 'svelte';
import { stringToQMSString_transformer, string_transformer } from '$lib/utils/dataStructureTransformers';
import type {
	GraphQLKind,
	QMSType,
	FieldWithDerivedData,
	RootType,
	SchemaData,
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


export const findNestedChildWithMultipleKeysOrIfLastHasQMSargumentsKey = (obj: unknown): Record<string, unknown> | boolean | null => {
	//console.log(obj)
	// Check if the input is an object
	if (typeof obj !== 'object' || obj === null) {
		return null;
	}
	const objectKeys = Object.keys(obj)
	const objectKeysLength = objectKeys.length
	if (objectKeysLength > 1) {
		return obj
	}
	if (obj.hasOwnProperty("QMSarguments") && objectKeysLength == 1) {
		return true
	}
	if (objectKeysLength == 1) {
		return findNestedChildWithMultipleKeysOrIfLastHasQMSargumentsKey(obj[objectKeys[0]])
	}

}

export const deleteIfChildrenHaveOneKeyAndLastKeyIsQMSarguments = (obj: unknown): Record<string, unknown> | null => {
	//console.log('ttt', obj)
	if (getPreciseType(obj) !== 'object' || obj === null) {
		return null;
	}
	///
	console.log({ obj })
	///
	for (const key in obj) {

		const keys = Object.keys(obj[key])
		const numberOfKeys = keys.length
		if (numberOfKeys == 1 && obj[key][keys[0]] == 'QMSarguments') {
			delete obj[key]
			return
		}
		const result = findNestedChildWithMultipleKeysOrIfLastHasQMSargumentsKey(obj[key])
		//console.log('yyresult', obj[key], result, getPreciseType(result) == 'object')
		if (result === true) {
			//console.log('to delete', obj[key])
			delete obj[key]
		}
		if (getPreciseType(result) == 'object') {
			deleteIfChildrenHaveOneKeyAndLastKeyIsQMSarguments(obj[key])
		}
	}
	return obj
}

// function removeObjIfContainsOnlyQMSarguments(obj) {
// 	for (let key in obj) {
// 		if (typeof obj[key] === 'object' && obj[key] !== null) {
// 			// Recursively call the function for nested objects
// 			removeObjIfContainsOnlyQMSarguments(obj[key]);

// 			// Check if the current object has only one key and that key is 'QMSarguments'
// 			if (Object.keys(obj[key]).length === 1 && Object.keys(obj[key])[0] === 'QMSarguments') {
// 				// Delete the object with key 'QMSarguments'
// 				delete obj[key];
// 			}
// 		}
// 	}
// 	return obj
// }
export const objectIsEmpty = (obj: Record<string, unknown>): boolean => {
	if (Object.keys(obj).length === 0 && obj.constructor === Object) {
		return true;
	} else {
		return false;
	}
}




export const build_QMS_bodyPart = (
	QMS_name: string,
	QMS_fields: Record<string, unknown>,
	QMS_args: Record<string, unknown>,
	QMS_type: QMSType = 'query',
	mergedChildren_finalGqlArgObj: Record<string, unknown>
): string | null => {
	if (Object.keys(QMS_fields).length == 0) {
		console.error('no cols data,choose at least one field');
		return null;
	}
	if (Object.keys(QMS_args).length == 0) {
		console.info('no args chosen');
	}

	console.log('qqqqqqqqqq', { QMS_args }, { QMS_fields }, { mergedChildren_finalGqlArgObj })
	const QMSarguments = { [QMS_name]: { QMSarguments: QMS_args } }
	const fullObject = JSON.parse(JSON.stringify(deleteIfChildrenHaveOneKeyAndLastKeyIsQMSarguments(_.mergeWith({}, QMSarguments, mergedChildren_finalGqlArgObj, QMS_fields))
	))
	// if (QMS_args && fullObject[QMS_name]) {
	// 	fullObject[QMS_name].QMSarguments = QMS_args
	// }
	//.replaceAll('\"QMSarguments\":','')
	// console.log('wwwwwwwww', { fullObject })

	const inputString = JSON.stringify(fullObject, function (key, value) {
		if (key === "QMSarguments") {
			console.log('QMSarguments', { value }, JSON.stringify(value))
			return "(" + JSON.stringify(value) + ")";
		}
		return value;
	}).replaceAll('\"QMSarguments\":', '')
	const listOfSubstrings = generateListOfSubstrings(inputString)
	console.log({ listOfSubstrings })
	//const modifiedString = listOfSubstrings.join('').replaceAll(/novaluehere|"|:/gi, '').slice(1, -1)
	//const modifiedString = listOfSubstrings.join('').replaceAll(/novaluehere|"|:/gi, '').slice(1, -1)
	const outsideTextModifier = (text: string): string => {
		return text.replaceAll(/novaluehere|"|:/gi, '')
	}


	const modifiedString = smartModifyStringBasedOnBoundries(listOfSubstrings.join(''), '(', ')', stringToQMSString_transformer, outsideTextModifier);

	console.log({ modifiedString })
	const QMS_bodyPart = modifiedString.slice(1, -1)


	//const QMS_bodyPart_FINAL = QMS_bodyPart.replaceAll(/novaluehere|"|:/gi, '').slice(1, -1)
	console.log({ QMS_bodyPart })
	return QMS_bodyPart
};
export const smartModifyStringBasedOnBoundries = (
	inputString: string,
	openBoundryChar: string = "(",
	closeBoundryChar: string = ")",
	insideTextModifier: ((text: string) => string) | undefined,
	outsideTextModifier: ((text: string) => string) | undefined,
	deleteBoundriesIfTextInsideIsEmpty: boolean = true
): string => {
	if (!inputString.includes(openBoundryChar)) {
		return inputString
	}
	let result: string[] = []
	//let splitByOpened=inputString.split('(')
	const splitByClosed = inputString.split(closeBoundryChar)
	splitByClosed.forEach((element) => {
		const splitByOpen = element.split(openBoundryChar)
		let outsidePart = splitByOpen[0]
		let insidePart = splitByOpen[1]
		if (outsidePart) {
			if (getPreciseType(outsideTextModifier) === 'function') {
				outsidePart = outsideTextModifier(outsidePart)
			}
			result.push(outsidePart)
		}
		if (insidePart) {
			if (getPreciseType(insideTextModifier) === 'function') {
				insidePart = insideTextModifier(insidePart)
			}
			if (deleteBoundriesIfTextInsideIsEmpty && insidePart == '') {
				result.push(``)
			} else {
				result.push(`${openBoundryChar}${insidePart}${closeBoundryChar}`)
			}
		}

	});

	return result.join('');
}
///
function replaceLastOccurrence(str: string, MaxIndex: number, REPLACEMENT_STRING: string): string {
	// Find the index of the first occurrence of ":{" after the first character
	const startIndex = str.indexOf(":{", 1);

	// If the first occurrence is found
	if (startIndex !== -1) {
		// Find the index of the last occurrence of ":{" before the fourth character
		const lastIndex = str.lastIndexOf(":{", MaxIndex);

		// If the last occurrence is found
		if (lastIndex !== -1) {
			// Replace the last occurrence with a new string (e.g., "REPLACEMENT_STRING")
			const replacedString = str.substring(0, lastIndex) + REPLACEMENT_STRING + str.substring(lastIndex + 2);

			return replacedString;
		}
	}

	// If no occurrences are found, return the original string
	return str;
}


var replaceBetween = function (string: string, start: number, end: number, what: string): string {
	return string.substring(0, start) + what + string.substring(end);
};
function modifyString(input: string): { modifiedSubstring: string; remainingString: string } {
	// Step 1: Match the first parenthesis and the text inside them
	const matchParenthesis = input.match(/\(([^)]+)\)/);
	let remainingString: string
	let modifiedSubstring: string
	if (!matchParenthesis) {
		modifiedSubstring = input
		remainingString = ''
		return { modifiedSubstring, remainingString }
	}
	const parenhtesisLength = matchParenthesis[0].length
	const parenhtesisStart = matchParenthesis.index
	const parenhtesisEnd = parenhtesisStart + parenhtesisLength

	//delete matched parenthesis and it's content from string
	input = replaceBetween(input, parenhtesisStart, parenhtesisEnd, '')
	//console.log({ matchParenthesis }, matchParenthesis.index)
	input = replaceLastOccurrence(input, matchParenthesis.index, matchParenthesis[0] + ":{")
	modifiedSubstring = input.substring(0, parenhtesisEnd)
	remainingString = input.substring(parenhtesisEnd, input.length)
	// Return the original string if no match is found
	return { modifiedSubstring, remainingString };
}
const generateListOfSubstrings = (string: string): string[] => {
	const substrings: string[] = []
	let reachedTheEnd = false
	while (!reachedTheEnd) {
		const { modifiedSubstring, remainingString } = modifyString(string)
		//console.log({ remainingString })
		if (remainingString === '') {
			reachedTheEnd = true
		}
		substrings.push(modifiedSubstring)
		string = remainingString
	}
	return substrings
}
const inputString2 = "query QMS_name{ authUserRoles:{ createdAt,id,role,userId,(order_by:[{createdAt:asc_nulls_last},{userId:desc_nulls_first}],limit:20,offset:0)roleByRole{role,userRoles_aggregate{nodes{id},aggregate{count}}} } }";

// Example usage: 
const inputString = ":{textBefore:{1dadas,2dasda,(inside parentheses1{iside1:'asd1'}),3dasds :{ textBefore2:{4dadas,5dasda,(inside parentheses2,inside2:'asd2'),6dasds :{";
const modifiedResult = modifyString(inputString);

//console.log(modifiedResult);
//console.log(replaceLastOccurrence("abc:{def:{ghi:{jkl", 10, "(fdsfds):{"));
//console.log('-------------------------------')
//console.log(inputString)
const listOfSubstrings = generateListOfSubstrings(inputString)
//console.log(inputString)
//console.log({ listOfSubstrings })
//console.log("joined", listOfSubstrings.join(''))
///
export const get_KindsArray = (type: Partial<FieldWithDerivedData>): GraphQLKind[] => {
	let kinds: GraphQLKind[] = [];

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
export const get_NamesArray = (type: Partial<FieldWithDerivedData>): string[] => {
	let names: string[] = [];

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

export let get_rootName = (namesArray: string[]): string => {
	return namesArray[namesArray.length - 1];
};

export let get_displayName = (namesArray: string[]): string => {
	return namesArray[0];
};
export const getRootType = (
	rootTypes: RootType[] | null,
	RootType_Name: string | undefined,
	schemaData: SchemaData
): RootType | undefined => {
	if (!rootTypes) {
		rootTypes = get(schemaData).rootTypes
	}

	return rootTypes.filter((type) => {
		return type.name == RootType_Name;
	})[0];
};

export const getFields_Grouped = (
	node: Partial<FieldWithDerivedData> | RootType,
	dd_displayNameToExclude: string[] = [],
	schemaData: SchemaData
): FieldsGrouped => {
	const node_rootType = schemaData?.get_rootType(
		null,
		node?.dd_rootName || node.parent_node.dd_rootName,
		schemaData
	);
	let scalarFields: FieldWithDerivedData[] = [];
	let non_scalarFields: FieldWithDerivedData[] = [];
	let enumFields: FieldWithDerivedData[] = [];

	let fieldsArray
	if (node?.args) {
		fieldsArray = node?.args
	} else if (node_rootType?.fields) {
		fieldsArray = node_rootType?.fields
	} else if (node_rootType?.inputFields) {
		fieldsArray = node_rootType?.inputFields
	} else if (node_rootType?.enumValues) {
		fieldsArray = node?.enumValues
	}


	fieldsArray?.filter((field) => {
		return !dd_displayNameToExclude.includes(field.dd_displayName)
	}).forEach((field) => {
		if (get_KindsArray(field).includes('ENUM')) {
			enumFields.push({ ...schemaData.get_rootType(null, field.dd_rootName, schemaData), ...field });
		} else
			if (get_KindsArray(field).includes('SCALAR')) {
				scalarFields.push(field);
			} else {
				non_scalarFields.push(field);
			}
	});
	// console.log('wwwww', {
	// 	node, node_rootType, fieldsArray, scalarFields,
	// 	non_scalarFields,
	// 	enumFields
	// })


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
	const stepsOfFieldsOBJ = colInfo?.stepsOfFieldsOBJ
	const stepsOfFields = colInfo?.stepsOfFields
	const stepsOfFieldsForDataGetter = colInfo?.stepsOfFieldsForDataGetter

	if (stepsOfFieldsInput) {
		return stepsOfFieldsInput
	}
	if (stepsOfFieldsForDataGetter) {
		return stepsOfFieldsForDataGetter
	}
	if (stepsOfFields) {
		return stepsOfFields
	}
	if (stepsOfFieldsOBJ) {
		//!!!change this like so:
		//here stringify and look for the first time there is a ",",this way you know there the object bifurcates into multiple paths and so,just before that is the farthest common step to all stepsOfFields
		//temporary solution:
		return []
	}
	return []
}
export const getDataGivenStepsOfFields = (
	colInfo: TableColumnData,
	row_resultData: unknown,
	stepsOfFieldsInput?: string[]
): unknown => {
	//col data is column info like colInfo.stepsOfFields,not the result's column data

	const stepsOfFields = getStepsOfFieldsForDataGetter(colInfo, stepsOfFieldsInput)
	if (stepsOfFields.length == 0) {
		return row_resultData
	}
	// const handleArray = (array, element) => {
	//     console.log('aaaa', { array })
	//     array = array.map((subElement) => {
	//         if (subElement?.[element] !== undefined) {
	//             return subElement[element];
	//         }
	//         if (Array.isArray(subElement) && subElement.length > 0) {
	//             return handleArray(subElement, element);
	//         }
	//         return []
	//         // return subElement[element]
	//     });
	//     return array;
	// };

	const handleStep = (step: string, colResultData: unknown): unknown => {
		//!!! there must be some changes made here because undefined == null (but typeof undefined !== null)
		//colResultData is undefined
		if (colResultData == undefined && row_resultData == null) {
			return null
		}
		if (colResultData == undefined && Array.isArray(row_resultData)) {
			return row_resultData[0];
		}
		if (colResultData !== undefined && colResultData == null) {
			return null
		}
		if (colResultData == undefined && row_resultData?.[step] !== undefined) {//!!! this must be changed  colResultData == undefined must become typeof colResultData == undefined,for now this change causes some problems,dig deeper next time
			return row_resultData[step];
		}
		if (colResultData == undefined) {
			return row_resultData
		}

		//colResultData is defined

		if (colResultData == null) {
			return null
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

		if (colResultData && colResultData?.[step] !== undefined) {
			return colResultData[step];
		}
		return colResultData;
	};
	let colResultData: unknown;
	stepsOfFields.every((step) => {
		colResultData = handleStep(step, colResultData);
		return true
	});

	return colResultData;
};

export const getTableCellData = (rowData: unknown, colData: TableColumnData, index: number): unknown => {
	let data;
	if (rowData) {
		if (rowData[index] !== undefined) {
			//rowData[index] //Not good,causes problems when two or more fields share fields,because in the results they will have data under the same column
			data = getDataGivenStepsOfFields(colData, rowData[index]);
		} else {
			data = getDataGivenStepsOfFields(colData, rowData);
		}
	} else {
		data = 'loading...';
	}

	return data;
};

export const formatData = (data: unknown = '', length: number, alwaysStringyfy: boolean = true): string => {
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
		if (a?.name < b?.name) {
			return -1;
		}
		if (a?.name > b?.name) {
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
		return endpointInfo.get_typeExtraData(typeInfo).displayInterface;
	}
	return null;
};

export const mark_paginationArgs = (args: FieldWithDerivedData[], endpointInfo: EndpointInfoStore): void => {
	const paginationPossibleNames = get(endpointInfo).paginationArgsPossibleNames;
	const paginationPossibleNamesKeys = Object.keys(paginationPossibleNames);
	args.forEach((arg) => {
		let matchingKey = paginationPossibleNamesKeys.find((key) => {
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
	schemaData: SchemaData
): string => {
	const standsForArray = paginationArgs.map((arg) => {
		return arg.dd_standsFor;
	});
	const paginationType = get_paginationTypes(endpointInfo, schemaData).find((paginationType) => {
		return paginationType.check(standsForArray);
	})?.name;
	if (paginationType) {
		return paginationType;
	}
	return 'unknown';
};
export const generate_derivedData = (
	type: Partial<FieldWithDerivedData>,
	rootTypes: RootType[] | null,
	isQMSField: boolean,
	endpointInfo: EndpointInfoStore,
	schemaData: SchemaData
): FieldWithDerivedData => {
	//type/field
	let derivedData = { ...type };
	derivedData.dd_kindsArray = get_KindsArray(type);
	derivedData.dd_namesArray = get_NamesArray(type);
	derivedData.dd_rootName = get_rootName(derivedData.dd_namesArray);
	derivedData.dd_displayName = get_displayName(derivedData.dd_namesArray);
	derivedData.dd_relatedRoot = getRootType(rootTypes, derivedData.dd_rootName, schemaData);


	derivedData.dd_kindEl = undefined;
	derivedData.dd_kindEl_NON_NULL = false;
	derivedData.dd_kindList = false;
	derivedData.dd_kindList_NON_NULL = false;
	derivedData.dd_NON_NULL = derivedData.dd_kindsArray[0] === 'NON_NULL';

	let dd_kindsArray_REVERSE = [...derivedData.dd_kindsArray].reverse();
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

	let displayInterface = get_displayInterface(derivedData, endpointInfo);

	if (['text', undefined].includes(derivedData.dd_displayInterface)) {
		derivedData.dd_displayInterface = displayInterface;
	}

	derivedData.dd_isArg = !type?.args;
	derivedData.dd_relatedRoot_inputFields_allScalar = derivedData.dd_relatedRoot?.inputFields?.every(
		(field) => {
			return get_KindsArray(field).includes('SCALAR');
		}
	);
	derivedData.dd_canExpand =
		!derivedData.dd_kindsArray?.includes('SCALAR') && derivedData.dd_kindsArray.length > 0;
	if (derivedData.dd_isArg) {
		const baseFilterOperatorNames = ['_and', '_or', '_not', 'and', 'or', 'not']
		let dd_baseFilterOperators = []
		let dd_nonBaseFilterOperators = []
		if (type?.inputFields) {
			type.inputFields
				.forEach(inputField => {
					if (baseFilterOperatorNames.includes(inputField.name)) {
						dd_baseFilterOperators.push(inputField.name)
						return inputField.name
					}
					if (inputField.name.startsWith('_')) {
						dd_nonBaseFilterOperators.push(inputField.name)
					}
				});

			if (!dd_baseFilterOperators?.length > 0) {
				dd_baseFilterOperators = undefined;
			}
			if (!dd_nonBaseFilterOperators?.length > 0) {
				dd_nonBaseFilterOperators = undefined;
			}
			derivedData.dd_baseFilterOperators = dd_baseFilterOperators
			derivedData.dd_nonBaseFilterOperators = dd_nonBaseFilterOperators

		}

		derivedData.dd_isRootArg = !(
			derivedData.dd_canExpand &&
			!derivedData?.dd_relatedRoot?.enumValues
		);
	}

	derivedData.dd_shouldExpand = derivedData.dd_canExpand && !derivedData.dd_relatedRoot?.enumValues;
	derivedData.dd_isQMSField = isQMSField ? true : false;

	derivedData.dd_castType = 'implement this.possible values:string,number,graphqlGeoJson...'; //example of why:date can be expected as timestamptz ("2016-07-20T17:30:15+05:30"),but must be casted as string
	derivedData.dd_derivedTypeBorrowed = 'implement this? maybe not?';
	////////// others
	if (derivedData?.dd_baseFilterOperators) {
		let defaultdisplayInterface = get_displayInterface(derivedData, endpointInfo);
		if (type?.inputFields !== undefined) {
			type.inputFields.forEach((inputField) => {
				Object.assign(inputField, { dd_displayInterface: defaultdisplayInterface });
			});
		}
	}
	if (derivedData.args) {
		mark_paginationArgs(derivedData.args, endpointInfo);
		derivedData.dd_paginationArgs = derivedData.args.filter((arg) => {
			return arg.dd_isPaginationArg;
		});
		derivedData.dd_paginationType = get_paginationType(derivedData.dd_paginationArgs, endpointInfo, schemaData);
	}
	derivedData.dd_relatedRoot = 'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON'

	if (isQMSField) {
		//derivedData.dd_tableName = endpointInfo.get_tableName(derivedData, schemaData)
	}
	//	derivedData.dd_StrForFuseComparison = `${derivedData.dd_displayName}  ${derivedData.dd_rootName} ${derivedData.description}`
	//${derivedData.dd_displayName}  ${derivedData.dd_rootName} ${derivedData.description}
	derivedData.dd_StrForFuseComparison = `${prepareStrForFuseComparison(`${derivedData.dd_displayName}   `)} `
	//console.log(derivedData.dd_StrForFuseComparison)
	return derivedData;
};
const prepareStrForFuseComparison = (str: string): string => {
	return str.replace(/(?=[A-Z_])/g, ' ').replace(/_/g, ' ').replace(/s|null/g, '').toLowerCase();
}

export const generate_gqlArgObj = (group_argumentsData: ActiveArgumentData[]): GQLArgObj => {
	// check for group if expects list and treat it accordingly like here --->https://stackoverflow.com/questions/69040911/hasura-order-by-date-with-distinct
	let gqlArgObj = {};
	let canRunQuery = true;
	group_argumentsData.every((argData) => {
		let _argumentCanRunQuery = argumentCanRunQuery(argData)
		if (!_argumentCanRunQuery) {
			canRunQuery = false
			return false
		}
		let { chd_dispatchValue, stepsOfFields, dd_displayName } =
			argData;

		let curr_gqlArgObj = gqlArgObj;
		curr_gqlArgObj[dd_displayName] = chd_dispatchValue
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
	const gqlArgObj_string = JSON.stringify(gqlArgObj)
	if (gqlArgObj_string == '{ }') {
		return ''
	}
	const gqlArgObj_stringModified = gqlArgObj_string
		.replace(/"/g, '')
		.replace(/'/g, `"`)
		.replace(/&Prime;/g, `\\"`)
		.replace(/&prime;/g, `'`)
		.slice(1, -1);
	return gqlArgObj_stringModified;
};
export const generate_group_gqlArgObjForRoot = (group_argumentsData: ActiveArgumentData[]): Record<string, unknown> => {
	return _.merge({}, ...group_argumentsData.map((arggumentData) => {
		return arggumentData.gqlArgObj
	}))
}
export const generate_group_gqlArgObj = (group: ActiveArgumentGroup): {
	group_gqlArgObj: Record<string, unknown>;
	group_gqlArgObj_string: string;
	group_canRunQuery: boolean;
} => {
	//if is where/filter (its related_root has filter_operators  ,like __or,__and,_not) handle differently after implementing the new ui
	let group_gqlArgObj = {};

	let group_argumentsData = group.group_args.filter((arg) => {
		return arg.inUse;
	});
	let group_canRunQuery = group_argumentsData.every((arg) => {
		return arg.canRunQuery;
	});
	if (group_argumentsData?.length > 0) {
		if (group.group_isRoot) {
			//console.log('root group handled');
			group_gqlArgObj = generate_group_gqlArgObjForRoot(group_argumentsData)
			console.log({ group_gqlArgObj, group_argumentsData })
		} else {
			console.error('Uncomment code for handling non root group');
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

	let group_gqlArgObj_string = gqlArgObjToString(group_gqlArgObj);
	return {
		group_gqlArgObj,
		group_gqlArgObj_string,
		group_canRunQuery
	};
};


const validItems = (items: { id: string }[], nodes: Record<string, ContainerData>): { id: string }[] => {
	return items.filter((item) => {
		let itemData = nodes[item.id];
		console.log('itemData.selectedRowsColValues', itemData.selectedRowsColValues)
		return itemData.inUse || (itemData.operator && validItems(itemData.items, nodes).length > 0 || itemData.selectedRowsColValues);
	});
};

//
export const filterElFromArr = <T>(arr: T[], undesiredElements: T[] = []): T[] => {
	return arr.filter((el) => {
		return !undesiredElements.includes(el);
	});
};

export const generate_group_gqlArgObj_forHasOperators = (items: { id: string }[], group_name: string, nodes: Record<string, ContainerData>): {
	resultingGqlArgObj: Record<string, unknown> | undefined;
	itemsResultingData: Record<string, unknown>[];
} => {
	let resultingGqlArgObj: Record<string, unknown> | undefined
	let itemsResultingData: Record<string, unknown>[] = []
	const spreadItemsIfInSpreadContainers = (items: { id: string }[]): { id: string }[] => {
		const spreadOutItems: { id: string }[] = []
		items.forEach(item => {
			if (item?.operator == '~spread~') {
				const validItemsResult = validItems(item.items, nodes);
				spreadOutItems.push(...validItemsResult)
			} else {
				spreadOutItems.push(item)
			}
		});
		return spreadOutItems
	}

	const spreadOutItems = spreadItemsIfInSpreadContainers(items)
	console.log({ items, spreadOutItems })
	spreadOutItems.forEach((item) => {
		let itemData = nodes[item.id];
		const isContainer = itemData.hasOwnProperty('items')
		const nodeStep = itemData?.stepsOfNodes[itemData?.stepsOfNodes.length - 1]
		const nodeStepClean = filterElFromArr(nodeStep, [null, undefined, 'bonded', 'list'])
		console.log({ nodeStep }, { nodeStepClean })

		const operator = itemData.operator
		let itemObj = {};
		let itemObjCurr = itemObj
		const displayName = itemData?.dd_displayName
		let dataToAssign

		if (isContainer) {
			const validItemsResult = validItems(spreadItemsIfInSpreadContainers(itemData.items), nodes);
			const gqlArgObjForItems = generate_group_gqlArgObj_forHasOperators(validItemsResult, group_name, nodes).itemsResultingData
			if (operator == 'bonded' || !itemData?.dd_kindList) {
				const merged_gqlArgObjForItems = _.merge({}, ...gqlArgObjForItems)
				dataToAssign = merged_gqlArgObjForItems
			} else {
				dataToAssign = gqlArgObjForItems
			}
			console.log('vvvvvvv', gqlArgObjForItems, dataToAssign)
		} else {
			dataToAssign = nodes[item.id]?.gqlArgObj
		}
		if (itemData.selectedRowsColValues) {


			if (Array.isArray(dataToAssign)) {
				dataToAssign = [...itemData.selectedRowsColValues, ...dataToAssign]
			} else {
				dataToAssign = _.merge({}, itemData.selectedRowsColValues[0], dataToAssign)

			}
		}
		resultingGqlArgObj = setValueAtPath({}, nodeStepClean, dataToAssign, true)
		let itemObjectTestCurr = setValueAtPath({}, nodeStepClean, dataToAssign, true)
		let itemObjectTest2 = 'not set'
		if (resultingGqlArgObj == undefined) {
			let itemObjectTest2 = 'set'
			//itemObjectTest2 = dataToAssign
			resultingGqlArgObj = dataToAssign
			itemObjectTestCurr = dataToAssign
		}

		if (isContainer) {
			if (itemData.not) {
				itemObjCurr['_not'] = displayName ? {} : dataToAssign;
				itemObjCurr = itemObjCurr['_not'];
			}
			if (displayName) {
				itemObjCurr[displayName] = dataToAssign
				itemObjCurr = itemObjCurr[displayName]
			} else {
				itemObjCurr = _.merge(itemObjCurr, dataToAssign)
			}
		}

		if (!isContainer && displayName) {
			if (itemData.not) {
				itemObjCurr['_not'] = dataToAssign;
				itemObjCurr = itemObjCurr['_not'];
			} else {
				itemObj = dataToAssign
			}
		}

		console.log(nodeStepClean, { itemObj }, { resultingGqlArgObj }, { itemObjectTest2 }, { itemObjectTestCurr }, { dataToAssign }, 'itemData.selectedRowsColValues', itemData.selectedRowsColValues)



		itemsResultingData.push(itemObj)

		console.log({ itemsResultingData, dataToAssign, itemData })
	});
	return {
		resultingGqlArgObj,
		itemsResultingData
	};
};

export const generate_group_gqlArgObjAndCanRunQuery_forHasOperators = (group: ActiveArgumentGroup): {
	group_gqlArgObj: Record<string, unknown> | undefined;
	group_gqlArgObj_string: string;
	group_canRunQuery: boolean;
} => {
	let { group_argsNode, group_name, group_hasAllArgs } = group;

	let group_canRunQuery = true;
	let nodes = JSON.parse(JSON.stringify(group_argsNode));
	let nodesArray = Object.values(nodes);
	let mainContainer = nodesArray.filter((node) => {
		return node.isMain;
	})[0];

	const generate_group_gqlArgObj_forHasOperatorsRESULT = generate_group_gqlArgObj_forHasOperators(
		[mainContainer],
		group_name,
		nodes
	)
	console.log({ generate_group_gqlArgObj_forHasOperatorsRESULT })

	let group_argumentsData = group.group_args.filter((arg) => {
		return arg.inUse;
	});
	group_canRunQuery = group_argumentsData.every((arg) => {
		return arg.canRunQuery;
	});
	let group_gqlArgObj
	if (group_hasAllArgs) {
		group_gqlArgObj = generate_group_gqlArgObj_forHasOperatorsRESULT.resultingGqlArgObj?.[mainContainer.dd_displayName]
	} else {
		group_gqlArgObj = generate_group_gqlArgObj_forHasOperatorsRESULT.resultingGqlArgObj
	}
	let group_gqlArgObj_string = gqlArgObjToString(group_gqlArgObj);
	return {
		group_gqlArgObj,
		group_gqlArgObj_string,
		group_canRunQuery
	};
};
////

export const generate_finalGqlArgObj_fromGroups = (activeArgumentsDataGrouped: ActiveArgumentGroup[]): FinalGQLArgObj => {
	let finalGqlArgObj = {};
	let final_canRunQuery = activeArgumentsDataGrouped.every((group) => { return group.group_canRunQuery })

	activeArgumentsDataGrouped.forEach((group) => {
		console.log({ group })
		Object.assign(finalGqlArgObj, group.group_gqlArgObj);
	});

	return { finalGqlArgObj, final_canRunQuery };
};

export const getQMSLinks = (QMSName: QMSType = 'query', parentURL: string, endpointInfo: EndpointInfoStore, schemaData: SchemaData): { url: string; title: string }[] => {
	let $page = get(page);
	let origin = $page.url.origin;
	let queryLinks: { url: string; title: string }[] = [];
	let $schemaData = get(schemaData);
	const sortIt = (QMSFields: FieldWithDerivedData[]): FieldWithDerivedData[] => {
		return QMSFields?.sort((a, b) => {
			let ea = a.dd_rootName;
			let eb = b.dd_rootName;
			let fa = a.dd_displayName.substring(6);
			let fb = b.dd_displayName.substring(6);
			let ga = a.dd_displayName;
			let gb = b.dd_displayName;
			return sortingFunctionMutipleColumnsGivenArray([
				[ea, eb],
				[fa, fb],
				[ga, gb]
			]);
		});
	}

	queryLinks = sortIt($schemaData?.[`${QMSName}Fields`])?.map((query) => {
		let queryName = query.name;
		let queryNameDisplay = queryName;
		let queryTitleDisplay = '';
		let currentQueryFromRootTypes = getRootType(null, query.dd_rootName, schemaData);
		let currentQMS_info = schemaData.get_QMS_Field(queryName, QMSName, schemaData);
		let endpointInfoVal = get(endpointInfo);
		const rowsLocation = endpointInfo.get_rowsLocation(currentQMS_info, schemaData);
		const nodeFieldsQMS_info = get_nodeFieldsQMS_info(currentQMS_info, rowsLocation, schemaData);
		let scalarFields = get_scalarColsData(nodeFieldsQMS_info, [
			currentQMS_info.dd_displayName,
			...rowsLocation
		], schemaData);

		let currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
			return field.name;
		});

		let mandatoryArgs = query?.args?.filter((arg) => {
			return arg.dd_NON_NULL;
		});
		let ID_Args = query?.args?.filter((arg) => {
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
		let queryLink = { url: `${parentURL}/${queryName}`, title: queryNameDisplay };
		return queryLink;
	});
	return queryLinks;
};

////////////////////////

export const stepsOfFieldsToQueryFragmentObject = (
	stepsOfFields: string[],
	excludeFirstStep: boolean = true,
	dataForLastStep: string = 'novaluehere'
): StepsOfFieldsObject => {
	let _stepsOfFields = [...stepsOfFields];
	if (excludeFirstStep) {
		_stepsOfFields.shift();

	}
	let _stepsOfFields_length = _stepsOfFields.length;
	let queryObject = {};
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

export const tableColsDataToQueryFields = (tableColsData: TableColumnData[]): StepsOfFieldsObject | string => {
	if (tableColsData.length == '') {
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
	console.log('argumentCanRunQuery', { arg })
	let argFinalValue = chd_dispatchValue;
	if (!inUse) {
		return true;
	}
	if (dd_kindList && !Array.isArray(argFinalValue)) {
		return false;
	}
	if (dd_kindList_NON_NULL && argFinalValue == null) {
		return false;
	}
	if (dd_kindEl && (argFinalValue == undefined || argFinalValue.length == 0)) {
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
	let infoToCast = {
		stepsOfFields,
		stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
		id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
		...type,
		...extraData
	};
	return infoToCast;
};

export const get_scalarColsData = (
	currentQMS_info: FieldWithDerivedData | null,
	prefixStepsOfFields: string[] = [],
	schemaData: SchemaData
): TableColumnData[] => {
	if (!currentQMS_info) {
		return []
	}
	let keep_currentQMS_info_dd_displayName = true;
	if (prefixStepsOfFields.length > 0) {
		keep_currentQMS_info_dd_displayName = false;
	}
	let dd_relatedRoot = getRootType(null, currentQMS_info.dd_rootName, schemaData);
	let { scalarFields } = getFields_Grouped(dd_relatedRoot, [], schemaData);
	let currentQuery_fields_SCALAR_names = scalarFields.map((field) => {
		return field.name;
	});
	//console.log('qqqq', { dd_relatedRoot, scalarFields, currentQuery_fields_SCALAR_names })
	let scalarColsData = currentQuery_fields_SCALAR_names.map((name) => {
		let stepsOfFields;
		if (keep_currentQMS_info_dd_displayName) {
			stepsOfFields = [...prefixStepsOfFields, currentQMS_info.dd_displayName, name];
		} else {
			stepsOfFields = [...prefixStepsOfFields, name];
		}

		let scalarColData = {
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
	schemaData: SchemaData
): FieldWithDerivedData => {
	if (rowsLocation?.length == 0) {
		return QMS_info;
	}

	let nodeFieldsQMS_info = QMS_info;
	if (!getRootType(null, nodeFieldsQMS_info?.dd_rootName, schemaData)?.fields) {
		return nodeFieldsQMS_info;
	}

	rowsLocation.forEach((curr_rowsLocation) => {
		if (!nodeFieldsQMS_info?.dd_rootName) {
			return nodeFieldsQMS_info;
		}
		if (!getRootType(null, nodeFieldsQMS_info.dd_rootName, schemaData)?.fields) {
			return nodeFieldsQMS_info;
		}
		nodeFieldsQMS_info = getRootType(null, nodeFieldsQMS_info.dd_rootName, schemaData).fields.find((field) => {
			return field.dd_displayName == curr_rowsLocation;
		});
	});
	if (!nodeFieldsQMS_info) {//todo:This is improvised,might cause issues
		return QMS_info;
	}
	return nodeFieldsQMS_info;
};

export const check_stepsOfFields = (stepsOfFields: string[], schemaData: SchemaData): void => {
	const currentQMS_info = schemaData.get_QMS_Field(stepsOfFields[0], 'query', schemaData);
};

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
export const sortingFunctionMutipleColumnsGivenArray = (array: [unknown, unknown][]): number => {
	let maxIndex = array.length - 1;
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
	prefix: string = '',
	group: ActiveArgumentGroup,
	activeArgumentsDataGrouped_Store: ActiveArgumentsDataGroupedStore,
	schemaData: SchemaData,
	endpointInfo: EndpointInfoStore
): void => {



	console.log({ node });
	const node_rootType = schemaData.get_rootType(
		null,
		node?.dd_rootName || node.parent_node.dd_rootName,
		schemaData
	);
	console.log({ node_rootType });
	const group_argsNode = group.group_argsNode;

	const dd_displayNameToExclude = [
		...node.items.map((item) => {
			return group_argsNode?.[item.id]?.dd_displayName;
		}), '_and', '_or', '_not', 'and', 'or', 'not'
	];
	console.log({ dd_displayNameToExclude });

	let fields_Grouped = getFields_Grouped(
		node,
		dd_displayNameToExclude, schemaData
	);
	let scalarFields = fields_Grouped.scalarFields
	let non_scalarFields = fields_Grouped.non_scalarFields
	let enumFields = fields_Grouped.enumFields

	console.log({ group, node, node_rootType, dd_displayNameToExclude, fields_Grouped });

	console.log({ scalarFields });
	console.log({ enumFields });

	[...scalarFields, ...enumFields].forEach((element) => {
		let stepsOfFields = [
			group.group_name || node.dd_displayName || node.parent_node.dd_displayName,
			element.dd_displayName
		];
		let newArgData = {
			stepsOfFields,
			stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
			id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
			...element
		};
		activeArgumentsDataGrouped_Store.add_activeArgument(newArgData, group.group_name, node?.id, endpointInfo);
	});

	let baseFilterOperators = ['_and', '_or', '_not', 'and', 'or', 'not']; //!!!this might create problem if there is some nonBase operator with the same name as one of these

	non_scalarFields
		?.filter((arg) => {
			return !baseFilterOperators.includes(arg.dd_displayName);
		})
		?.forEach((element) => {
			let stepsOfFields = [
				group.group_name || node.dd_displayName || node.parent_node.dd_displayName,
				element.dd_displayName
			];
			// if (stepsOfFields[stepsOfFields.length - 1] !== element.dd_displayName) {
			// 	stepsOfFields.push(element.dd_displayName); //take care might caus eproblems
			// }

			let newContainerData = {
				stepsOfFields,
				stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
				id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
				...element
			};
			console.log({ newContainerData });
			let randomNr = Math.random();
			console.log('group', group);
			let newContainerDataRootType = schemaData.get_rootType(
				null,
				newContainerData.dd_rootName,
				schemaData
			);
			let hasBaseFilterOperators = newContainerDataRootType?.dd_baseFilterOperators;
			let NODEhasBaseFilterOperators = schemaData.get_rootType(
				null,
				node.dd_rootName,
				schemaData
			)?.dd_baseFilterOperators;
			let hasNonBaseFilterOperators = newContainerDataRootType?.dd_nonBaseFilterOperators;

			let isListContainer = newContainerData?.dd_kindList;
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

			group.group_argsNode[`${randomNr}`] = {
				items: [],
				...newContainerData,
				inputFields: newContainerDataRootType?.inputFields,
				id: randomNr,
				operator,
				not: false,
				isMain: false,
			};
			console.log({ newContainerDataRootType });
			console.log({ newContainerData });
			if (node?.items) {
				node.items.push({ id: randomNr });
			} else {
				group.group_argsNode['mainContainer'].items.push({ id: randomNr });
			}
		});
	activeArgumentsDataGrouped_Store.update((data) => { return data })//force update

	node.addDefaultFields = false;
}


export const stigifyAll = (data: unknown): string => {
	return JSON.stringify(data, function (key, value) {
		if (typeof value === "function") {
			return "/Function(" + value.toString() + ")/";
		}
		return value;
	});
}



export const parseAll = (json: string): unknown => {
	return JSON.parse(json, function (key, value) {
		if (typeof value === "string" &&
			value.startsWith("/Function(") &&
			value.endsWith(")/")) {
			value = value.substring(10, value.length - 2);
			return (0, eval)("(" + value + ")");
		}
		return value;
	});
}


export const stringToJs = (string: unknown): unknown => {
	if (getPreciseType(string) !== "string") {
		console.warn(`expectig string but got ${getPreciseType(string)},will use it as is.If object,you do not need this function,maybe this function was run previously.`, { string });
		return string;
	}
	if (string.includes('/Function') && string.includes(')/')) {
		return parseAll(string);
	}
	return new Function(`return ${string}`)();
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
				Object.entries(obj)
					.map(([key, value]) => {
						if (key.includes('-')) {
							key = `'${key}'`
						}
						return `${key}: ${convertObjectToSourceCode(value)}`
					})
					.join(', ') +
				'}'
			);
		}

		// All other types are converted to string literals
		return JSON.stringify(obj);
	}

	return convertObjectToSourceCode(obj);
}
export const hasDeepProperty = (obj: Record<string, unknown>, propertyPath: string[]): boolean => {
	let currentObj = obj;
	for (let i = 0; i < propertyPath.length; i++) {
		const prop = propertyPath[i];
		if (!currentObj.hasOwnProperty(prop)) {
			return false;
		}
		currentObj = currentObj[prop];
	}
	return true;
}
export const getDeepField = (
	obj: Partial<FieldWithDerivedData>,
	propertyPath: string[],
	schemaData: SchemaData,
	fieldsType: 'fields' | 'inputFields' = 'fields'
): FieldWithDerivedData | null => {
	console.log({ obj, propertyPath })
	if (propertyPath.length == 0 || propertyPath[propertyPath.length - 1] == obj.dd_displayName) {//!!!this is a hack,might cause problem dd_displayName is the same in multiple places
		return obj
	}
	let currentObj = obj;
	for (let i = 0; i < propertyPath.length; i++) {
		const prop = propertyPath[i];
		const currentObjRootType = schemaData.get_rootType(null, currentObj?.dd_rootName, schemaData)
		const currentObjRootTypeFields = currentObjRootType?.[fieldsType]
		const nextObj = currentObjRootTypeFields?.find((field) => { return field.dd_displayName == prop })

		if (!nextObj) {
			return null;
		}
		currentObj = nextObj
	}
	return currentObj;
}

export const passAllObjectValuesThroughStringTransformerAndReturnNewObject = (obj: Record<string, unknown>): Record<string, unknown> => {
	//!!! to do: make this function recursive to handle nested objects and arrays

	let newObj = { ...obj };
	Object.keys(obj).forEach((key) => {
		if (typeof obj[key] == 'string') {
			newObj[key] = string_transformer(obj[key]);
		}
	});
	return newObj;
};


export const getValueAtPath = (obj: Record<string, unknown>, path: string[]): unknown => {
	let current = obj;

	for (let i = 0, len = path.length; i < len; i++) {
		current = current?.[path[i]];

		// If the current level is undefined, exit early
		if (current === undefined) {
			return undefined;
		}
	}

	return current;
}

export const getPreciseType = (value: unknown): string => {
	return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}


export const deleteValueAtPath = (obj: Record<string, unknown>, path: string[]): Record<string, unknown> | void => {
	if (!obj || !path || path.length === 0) {
		// Check for valid input
		console.error('Invalid input');
		return;
	}

	let currentObj = obj;

	for (let i = 0; i < path.length - 1; i++) {
		// Traverse the object to the specified path
		//if (currentObj?.[path[i]] === undefined) {
		if (currentObj[path[i]] === undefined) {
			// If the path does not exist, return
			console.error('Path does not exist');
			return;
		}
		currentObj = currentObj[path[i]];
	}

	// Delete the value at the final key in the path
	delete currentObj[path[path.length - 1]];
	return obj;
}
export const setValueAtPath = (
	obj: Record<string, unknown>,
	path: string[],
	value: unknown,
	addPathIfNotExist: boolean = true
): Record<string, unknown> | void => {
	if (!obj || !path || path.length === 0) {
		// Check for valid input
		console.error('Invalid input');
		return;
	}

	let currentObj = obj;

	for (let i = 0; i < path.length - 1; i++) {
		// Traverse the object to the specified path
		//if (currentObj?.[path[i]] === undefined) {
		if (currentObj[path[i]] === undefined) {
			if (addPathIfNotExist) {
				// If the path does not exist, add it
				console.info('Path does not exist,adding it');
				currentObj[path[i]] = {}
			}
			if (!addPathIfNotExist) {
				// If the path does not exist, return
				console.error('Path does not exist');
				return;
			}
		}
		currentObj = currentObj[path[i]];
	}

	// Set the value at the final key in the path
	currentObj[path[path.length - 1]] = value;
	return obj;
}
export const generate_finalGqlArgObjAndCanRunQuery = (
	activeArgumentsDataGrouped: ActiveArgumentGroup[],
	_paginationState_Store: PaginationStateStore | null,
	resetPaginationState: boolean = true
): FinalGQLArgObj => {
	//reset pagination state too !!!THIS MIGHT TRIGGER 1 EXTRA SERVER REQUEST,seems not from what i saw
	if (resetPaginationState && _paginationState_Store) {
		_paginationState_Store.resetToDefault();
	}
	//
	console.log('regenerate_groupsAndfinalGqlArgObj RUN');
	const groups_gqlArgObj = activeArgumentsDataGrouped.map((group) => {
		if (group.group_argsNode) {
			return generate_group_gqlArgObjAndCanRunQuery_forHasOperators(group);
		} else {
			return generate_group_gqlArgObj(group);
		}
	});
	return generate_finalGqlArgObj_fromGroups(groups_gqlArgObj);
	//better set an array?
}

export const getQMSWraperCtxDataGivenControlPanelItem = (CPItem: { stepsOfFieldsThisAppliesTo: string[] }, OutermostQMSWraperContext: { mergedChildren_QMSWraperCtxData_Store: any }): any => {
	const { mergedChildren_QMSWraperCtxData_Store } = OutermostQMSWraperContext;

	let mergedChildren_QMSWraperCtxData_Value = get(mergedChildren_QMSWraperCtxData_Store);

	const QMSWraperCtxData = mergedChildren_QMSWraperCtxData_Value.find((currCtx) => {
		return currCtx.stepsOfFields.join() == CPItem.stepsOfFieldsThisAppliesTo.join();
	});
	return QMSWraperCtxData;
};
export const getSortedAndOrderedEndpoints = (endpoints: { id: number; isMantained?: boolean }[], filterOutIfNotMaintaned: boolean = false): { id: number; isMantained?: boolean }[] => {
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