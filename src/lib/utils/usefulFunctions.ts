//QM means QueryOrMutation

import { get } from 'svelte/store';
import { scalarsAndEnumsDisplayTypes } from '$lib/stores/scalarsAndEnumsDisplayTypes';
export const buildQueryBody = (queryName, queryFragments, gqlArgObj_string) => {
    return `
    query MyQuery {
  ${queryName}${gqlArgObj_string ? `(${gqlArgObj_string})` : ''}{
${queryFragments}
  }
}
    `;
};

export const generateFragmentData = (field, rootTypes, flatten, deeperIfNoScalar = true) => {// !!! refactor this using current data
    let fieldName = field.name;
    let isScalar = get_KindsArray(field).includes('SCALAR');
    let fragmentData;
    let subFields;
    let subFields_scalar;

    if (isScalar) {
        if (flatten) {
            fragmentData = fieldName;
        } else {
            fragmentData = [fieldName];
        }
    } else {
        fragmentData = [fieldName];
        subFields = getRootType(rootTypes, get_rootName(get_NamesArray(field))).fields;
        subFields_scalar = subFields.filter((subField) => {
            return get_KindsArray(subField).includes('SCALAR');
        });

        if (flatten) {
            if (subFields_scalar.length > 0) {
                fragmentData.push(
                    subFields_scalar.map((subField) => {
                        return subField.name;
                    })
                );
            } else {
                if (deeperIfNoScalar) {
                    console.log('subFields', subFields);
                    fragmentData.push(
                        subFields.map((subField) => {
                            return generateFragmentData(subField, rootTypes, true, true);
                        })
                    );
                } else {
                    return undefined;
                }
            }
        } else {
            fragmentData.push(subFields);
        }
    }
    return fragmentData;
};

export const fragmentDataToFragment = (fragmentData) => {
    //accepts an array,so to be sure put input between [], ex:fragmentDataToFragment([input])
    let res;
    if (typeof fragmentData == 'string') {
        res = fragmentData;
    } else {
        res = fragmentData.map((el) => {
            if (typeof el == 'string') {
                return el;
            } else {
                return [el[0], '\n{', fragmentDataToFragment(el[1]), '}\n'];
            }
        });
    }
    return res;
};

export const generateQueryFragments = (tableColsData = []) => {
    let body = ``;
    let queryFragment;
    tableColsData.forEach((colData) => {
        queryFragment = colData?.queryFragment;
        if (typeof queryFragment == 'string') {
            body = body + `\n ${queryFragment}`;
        } else {
            body = body + `\n ${fragmentDataToFragment([queryFragment])}`;
        }
    });

    return body;
};

export const getQM_mandatoryArguments = (QM) => {
    //QM means QueryOrMutation
    if (QM?.args) {
        let mandatoryArgs = [];
        mandatoryArgs = QM?.args?.filter((arg) => {
            return arg?.type?.kind === 'NON_NULL' || arg?.type?.name === 'ID';
        });
        if (mandatoryArgs.length >= 1) {
            return mandatoryArgs;
        } else {
            return false;
        }
    } else {
        return { has: false };
    }
};

export const getQM_Field = (QMFields, queryName) => {
    //QM means QueryOrMutation
    return QMFields.filter((field) => {
        return field.name == queryName;
    })[0];
};

export const get_KindsArray = (type) => {
    let kinds = [];

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
export const get_NamesArray = (type) => {
    let names = [];

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

export let get_rootName = (namesArray) => {
    return namesArray[namesArray.length - 1];
};

export let get_displayName = (namesArray) => {
    return namesArray[0];
};
export const getRootType = (rootTypes, RootType_Name) => {
    return rootTypes.filter((type) => {
        return type.name == RootType_Name;
    })[0];
};

export const getFields_Grouped = (rootField) => {
    let scalarFields = [];
    let non_scalarFields = [];

    rootField?.fields?.forEach((field) => {
        if (get_KindsArray(field).includes('SCALAR')) {
            scalarFields.push(field);
        } else {
            non_scalarFields.push(field);
        }
    });

    return {
        scalarFields: scalarFields,
        non_scalarFields: non_scalarFields
    };
};

// export const getArguments_Grouped = (QM) => {
//     let scalarArgs = []
//     let non_scalarArgs = []
//     console.log(QM)
//     console.log(QM.args)
//     QM?.args?.forEach(arg => {
//         if (get_KindsArray(arg).includes('SCALAR')) {
//             scalarArgs.push(arg)
//         } else {
//             non_scalarArgs.push(arg)

//         }
//     });

//     return {
//         scalarArgs: scalarArgs, non_scalarArgs: non_scalarArgs
//     }
// }

export const getArguments_withInfo = (QM) => {
    let args = QM?.args?.map((arg) => {
        return {
            arg: arg,
            kindsArray: get_KindsArray(arg)
        };
    });
    return args;
};

// export const stepsOfFieldsToColData = (stepsOfFields) => {
//     let colData;
//     if (stepsOfFields.length == 1) {
//         colData = stepsOfFields[0][0];
//     } else {
//         let stepsOfFields_Len = stepsOfFields.length;
//         for (let i = stepsOfFields_Len; i > 0; i--) {
//             if (colData) {
//                 if (i > 1) {
//                     colData = [[...stepsOfFields[i - 1], colData]];
//                 } else {
//                     colData = [...stepsOfFields[i - 1], colData];
//                 }
//             } else {
//                 colData = [...stepsOfFields[i - 1]];

//                 // if (typeof stepsOfFields[i - 1] == 'string') {
//                 //     colData = [...stepsOfFields[i - 1]]
//                 // } else {

//                 //     colData = [...stepsOfFields[i - 1]]//change
//                 // }
//             }
//         }
//     }

//     return colData;
// };

export const stepsOfFieldsFlatten = (stepsOfFields, stepsOfFildsStringAll) => {//if takes multiple paths,make one 'stepsOfFields' for each path,as to preserve the stepsOfFields syntax,where only the last element can be an array and that can only contain strings
    let lastStepIndex = stepsOfFields.length - 1
    let stepsOfFieldsFlat = []

    let stepsOfFildsStringEl
    let stepsOfFildsLastStep = stepsOfFields[lastStepIndex]
    if (typeof stepsOfFields[lastStepIndex][0] == 'string') {
        stepsOfFieldsFlat = stepsOfFields
    } else {
        stepsOfFildsStringEl = stepsOfFields.filter((el) => {
            return !Array.isArray(el)
        })
        stepsOfFieldsFlat = stepsOfFildsLastStep.map((el) => {
            console.log('el===', el)
            let stepsOfFieldsForEl


            if (typeof el[el.length - 1][el[el.length - 1].length - 1] == 'string') { //support one way in
                stepsOfFieldsForEl = [...stepsOfFildsStringEl, ...el]
            } else {//support deeper way in

            }

            return stepsOfFieldsForEl
        })


    }
    return stepsOfFieldsFlat
}
export const stepsOfFieldsToQueryFragment = (stepsOfFields) => {
    let queryFragment;

    if (typeof stepsOfFields[stepsOfFields.length - 1][0] == 'string') {
        queryFragment = `${stepsOfFields.join('{')}${'}'.repeat(stepsOfFields.length - 1)}`;
    } else {

        console.log('stepsOfFieldsFlatten() teststeps', stepsOfFieldsFlatten(stepsOfFields))

        console.error('--HANDLE THIS if important for app,most likely not---', stepsOfFields, `${stepsOfFields.join('{')}${'}'.repeat(stepsOfFields.length - 1)}`)
        //here you must handle the situation where the selected data for column doesn't have direct scalar fields
    }

    return queryFragment;
};

//colData must become colInfo everywhere,for less ambiguity
export const getColResultData = (colData, row_resultData) => {
    //col data is column info like colData.stepsOfFieldsNew,not the result's column data
    // console.log('getColResultData start here', colData, row_resultData)
    let stepsOfFieldsNew = colData.stepsOfFieldsNew;
    let colResultData;

    const handleArray = (array, element) => {
        // console.log('handleArray array, element ', array, element)
        array = array.map((subElement) => {
            //  console.log('subElement?.[element]', subElement?.[element])
            if (subElement?.[element] !== undefined) {
                //   console.log('subElement?.[element] !== undefined')
                return subElement[element];
            } else if (typeof subElement == 'object' && subElement.length > 0) {
                //  console.log('typeof subElement == object && subElement.length > 0')
                return handleArray(subElement, element);
            } else {
                return [];
            }
            // return subElement[element]
        });
        return array;
    };

    // console.log('qqq start stepsOfFieldsNew', stepsOfFieldsNew)

    stepsOfFieldsNew.forEach((element) => {
        //  console.log('qqq start colResultData element', colResultData, element)
        if (typeof element == 'string') {
            if (colResultData?.length > 0) {
                //is array
                // console.log('---------array')
                let handleArrayResult = handleArray(colResultData, element);
                // console.log('handleArrayResult', handleArrayResult, JSON.stringify(handleArrayResult))
                colResultData = handleArrayResult;

                // colResultData = colResultData.map((subElement) => {
                //     if (subElement?.[element] !== undefined) {
                //         return subElement[element]
                //     } else if (typeof subElement == 'object' && subElement.length > 0) {
                //         console.log('---------array subElement.length > 0', subElement)
                //         return subElement.map((subSubElement) => {
                //             console.log('subSubElement', subSubElement)
                //             console.log('subSubElement?.[element]', subSubElement?.[element])
                //             if (subSubElement?.[element] !== undefined) {
                //                 console.log('subSubElement[element]', subSubElement[element])
                //                 return subSubElement[element] //supports deep of one to many like so: //edges > node > filmConnection > films > title
                //             } else if (typeof subElement == 'object' && subSubElement?.length > 0) {
                //                 return subSubElement.map((subSubSubElement) => {
                //                     if (subSubSubElement?.[element] !== undefined) {
                //                         console.log('subSubSubElement[element]', subSubSubElement[element])
                //                         return subSubSubElement[element] //supports deep of one to many like so: //edges > node > filmConnection > films > characterConnection > characters > name
                //                     } else {

                //                     }
                //                 })
                //             }
                //         })
                //     }
                //     else {
                //         return []
                //     }
                //     // return subElement[element]
                // })
            } else if (colResultData?.length == 0) {
                //do nothing in this case
                // console.log('colResultData?.length == 0')
            } else if (colResultData !== undefined) {
                //is not array but is defined
                // console.log('----------------')
                if (colResultData?.[element] !== undefined) {
                    colResultData = colResultData[element];
                    // console.log('===================')
                } else {
                    //? may cause problems
                    colResultData = null; //? may cause problems
                } //? may cause problems
            } else {
                //is undefined
                if (row_resultData?.[element] !== undefined) {
                    colResultData = row_resultData[element];
                } else if (typeof row_resultData == 'object') {
                    if (row_resultData?.length > 0) {
                        //is array
                        // console.log('is undefined --> ---------array')
                        colResultData = row_resultData;
                        // .map((subElement) => {
                        //     return subElement?.[element]
                        // })
                    } else if (colResultData?.length == 0) {
                        //do nothing in this case
                        //  console.log('colResultData?.length == 0')
                    }
                } else if (typeof row_resultData == 'number') {
                    colResultData = row_resultData;
                } else {
                    //console.log('row_resultData', row_resultData)
                    // console.log('+++++')
                    //colResultData = 'unknown do some research'
                }
            }
        }

        // console.log('qqq end colResultData', colResultData)
    });
    // console.log('end all colResultData', colResultData)
    return colResultData;
};

export const getData = (row, colData, index) => {
    let dateNow = new Date();
    // console.log('*******************************************************')
    // console.log('aaaa getColResultData', dateNow);
    //console.log('data = row', row);

    let data;
    if (row) {
        if (row[index] !== undefined) {
            //row[index] //Not good,causes problems when two or more fields share fields,because in the results they will have data under the same column
            data = getColResultData(colData, row[index]);
        } else {
            data = getColResultData(colData, row);
        }
    } else {
        data = 'loading...';
    }

    return data;
};

export const formatData = (data = '', length, alwaysStringyfy = true) => {
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

export const elementToDisplay = (rawData) => {
    let { kinds, names } = rawData;
    let displayType;
    let RootType_Name = get_rootName(names);
    let _scalarsAndEnumsDisplayTypes = get(scalarsAndEnumsDisplayTypes);
    let lastKind = kinds[kinds.length - 1];
    if (lastKind == 'ENUM') {
        displayType = 'ENUM';
    } else if (lastKind == 'INPUT_OBJECT') {
        displayType = 'INPUT_OBJECT';
    } else {
        displayType = _scalarsAndEnumsDisplayTypes[RootType_Name];
    }

    return {
        required: kinds[0] == 'NON_NULL',
        expectsList: kinds.includes('LIST'),
        displayType,
        displayName: get_displayName(names),
        rawData
    };
};


export const sortByName = (array) => {
    array?.sort((a, b) => {
        if (a?.name < b?.name) {
            return -1;
        }
        if (a?.name > b?.name) {
            return 1;
        }
        return 0;
    });

    return array
}

export const generate_derivedData = (type, rootTypes) => { //type/field  
    let derivedData = {}
    derivedData.dd_kindsArray = get_KindsArray(type)
    derivedData.dd_namesArray = get_NamesArray(type)
    derivedData.dd_rootName = get_rootName(derivedData.dd_namesArray)
    derivedData.dd_displayName = get_displayName(derivedData.dd_namesArray)
    derivedData.dd_relatedRoot = getRootType(rootTypes, derivedData.dd_rootName)
    //start set derivedData for dd_relatedRoot  ---

    //end set derivedData for dd_relatedRoot    ---

    derivedData.dd_kindEl = undefined
    derivedData.dd_kindEl_NON_NULL = false
    derivedData.dd_kindList = false
    derivedData.dd_kindList_NON_NULL = false
    derivedData.dd_NON_NULL = derivedData.dd_kindsArray[0] === 'NON_NULL'

    let dd_kindsArray_REVERSE = [...derivedData.dd_kindsArray].reverse()
    dd_kindsArray_REVERSE.forEach(el => {
        if (el == 'LIST') {
            derivedData.dd_kindList = true
        } else if (el == 'NON_NULL') {
            if (derivedData.dd_kindList) {
                derivedData.dd_kindList_NON_NULL = true
            } else {
                derivedData.dd_kindEl_NON_NULL = true
            }
        } else {
            derivedData.dd_kindEl = el
        }
    });

    let _scalarsAndEnumsDisplayTypes = get(scalarsAndEnumsDisplayTypes);
    if (derivedData.dd_kindEl == 'ENUM') {
        derivedData.dd_displayType = 'ENUM';
    } else if (derivedData.dd_kindEl == 'INPUT_OBJECT') {
        derivedData.dd_displayType = 'INPUT_OBJECT';
    } else {
        derivedData.dd_displayType = _scalarsAndEnumsDisplayTypes[derivedData.dd_rootName];
    }
    derivedData.dd_isArg = !type?.args
    derivedData.dd_relatedRoot_inputFields_allScalar = derivedData.dd_relatedRoot?.inputFields?.every((field) => {
        return get_KindsArray(field).includes('SCALAR');
    });
    derivedData.dd_canExpand = !derivedData.dd_kindsArray?.includes('SCALAR') && derivedData.dd_kindsArray.length > 0
    if (derivedData.dd_isArg) {
        derivedData.dd_filterOperators = type?.inputFields?.filter((inputField) => {//_and/_or/_not
            return inputField.name[0] == '_'
        })?.map((inputField) => { return inputField.name })
        if (!derivedData?.dd_filterOperators?.length > 0) {
            derivedData.dd_filterOperators = undefined
        }
        derivedData.dd_isRootArg = !(derivedData.dd_canExpand && !derivedData.dd_relatedRoot_inputFields_allScalar && !derivedData?.dd_relatedRoot?.enumValues)
    }
    // derivedData.id = derivedData.dd_namesArray.join('-')

    derivedData.dd_shouldExpand = derivedData.dd_canExpand && !derivedData.dd_relatedRoot?.enumValues
    derivedData.dd_isQMSField = 'to do this'
    return derivedData
}



export const generate_gqlArgObj = (group_argumentsData) => {
    // check for group if expects list and treat it accordingly like here --->https://stackoverflow.com/questions/69040911/hasura-order-by-date-with-distinct
    let gqlArgObj = {};
    let canRunQuery = true;
    group_argumentsData.forEach((argData) => {
        if (argData.inUse) {
            let { chd_chosen, chd_dispatchValue, chd_needsValue, chd_needsChosen, stepsOfFieldsNew } =
                argData;

            let curr_gqlArgObj = gqlArgObj;
            stepsOfFieldsNew.forEach((step, index) => {
                let isLast = index == stepsOfFieldsNew.length - 1;
                if (isLast) {
                    console.log('chd_needsValue', chd_needsValue);
                    if (!chd_needsChosen) {
                        if (!curr_gqlArgObj?.[step]) {
                            curr_gqlArgObj[step] = chd_dispatchValue;
                        }
                        curr_gqlArgObj = curr_gqlArgObj[step];
                    } else {
                        if (chd_needsValue == undefined) {
                            canRunQuery = false;
                            console.log('canRunQuery = false', canRunQuery);
                        } else if (!chd_needsValue) {
                            curr_gqlArgObj[step] = chd_chosen;
                            if (!(Array.isArray(chd_chosen) || typeof chd_chosen == 'string')) {
                                canRunQuery = false;
                                console.log('canRunQuery = false', canRunQuery);
                            }
                        } else {
                            console.log('chd_dispatchValue', chd_dispatchValue);
                            console.log('!chd_dispatchValue', !chd_dispatchValue);

                            if (!curr_gqlArgObj?.[step]) {
                                curr_gqlArgObj[step] = {};
                            }
                            curr_gqlArgObj = curr_gqlArgObj[step];

                            curr_gqlArgObj[chd_chosen] =
                                chd_dispatchValue !== undefined ? chd_dispatchValue : '';
                            curr_gqlArgObj = curr_gqlArgObj[chd_chosen];

                            console.log('----curr_gqlArgObj', curr_gqlArgObj);
                            if (chd_dispatchValue == undefined) {
                                canRunQuery = false;
                                console.log('canRunQuery = false', canRunQuery);
                            }
                        }
                    }
                } else {
                    if (!curr_gqlArgObj?.[step]) {
                        curr_gqlArgObj[step] = {};
                    }
                    curr_gqlArgObj = curr_gqlArgObj[step];
                }
            });
            console.log('curr_gqlArgObj', curr_gqlArgObj);
        }
    });

    console.log('gqlArgObj', gqlArgObj);
    console.log('canRunQuery', canRunQuery);

    return {
        arg_gqlArgObj: gqlArgObj, arg_canRunQuery: canRunQuery, gqlArgObj,
        canRunQuery, note: 'these are repeated for easy refactoring while keeping the old working: arg_gqlArgObj: gqlArgObj, arg_canRunQuery: canRunQuery, gqlArgObj,canRunQuery'
    };
};
export const gqlArgObjToString = (gqlArgObj) => {
    let gqlArgObj_string = JSON.stringify(gqlArgObj)
        .replace(/"/g, '')
        .replace(/'/g, `"`)
        .slice(1, -1);
    return gqlArgObj_string
}
export const generate_final_gqlArgObjTEST = (activeArgumentsDataGrouped) => {
    let final_gqlArgObj = {};
    let final_canRunQuery = true;
    activeArgumentsDataGrouped.forEach((group) => {
        let group_argumentsData = group.group_args.filter((arg) => {
            return arg.inUse;
        });

        if (group_argumentsData?.length > 0) {
            console.log('group_argumentsData', group_argumentsData);

            if (group.group_isRoot) {
                console.log('root group handled');
                let { gqlArgObj, canRunQuery } = generate_gqlArgObj(group_argumentsData);
                final_gqlArgObj = { ...final_gqlArgObj, ...gqlArgObj };
                if (canRunQuery == false) {
                    final_canRunQuery = false;
                }
            } else {
                console.log('NON root group handled');
                if (group.dd_kindList) {
                    let list = [];
                    list = group_argumentsData.map((arg) => {
                        let { gqlArgObj, canRunQuery } = generate_gqlArgObj([arg]);
                        console.log('-=-=-canRunQuery', canRunQuery);
                        if (canRunQuery == false) {
                            //will give off not good results for canRunQuery,must change handling in generate_gqlArgObj
                            final_canRunQuery = false;
                        }
                        return gqlArgObj[group.group_name];
                    });
                    final_gqlArgObj[group.group_name] = list;
                    final_gqlArgObj = { ...final_gqlArgObj };
                    console.log('list---', list);
                } else {
                    let { gqlArgObj, canRunQuery } = generate_gqlArgObj(group_argumentsData);
                    final_gqlArgObj = { ...final_gqlArgObj, ...gqlArgObj };
                    if (canRunQuery == false) {
                        final_canRunQuery = false;
                    }
                }
            }
        }
    });
    //handle root group

    let final_gqlArgObj_string = gqlArgObjToString(final_gqlArgObj)
    return {
        final_gqlArgObj,
        final_gqlArgObj_string,
        final_canRunQuery
    }
};



export const generate_group_gqlArgObj = (group) => {//if is where/filter (its related_root has filter_operators  ,like __or,__and,_not) handle differently after implementing the new ui
    let group_gqlArgObj = {};
    let group_canRunQuery = true;
    let group_argumentsData = group.group_args.filter((arg) => {
        return arg.inUse;
    });

    if (group_argumentsData?.length > 0) {
        console.log('group_argumentsData', group_argumentsData);

        if (group.group_isRoot) {
            console.log('root group handled');
            let { gqlArgObj, canRunQuery } = generate_gqlArgObj(group_argumentsData);
            group_gqlArgObj = { ...group_gqlArgObj, ...gqlArgObj };
            if (canRunQuery == false) {
                group_canRunQuery = false;
            }
        } else {
            console.log('NON root group handled');
            if (group.dd_kindList) {
                let list = [];
                list = group_argumentsData.map((arg) => {
                    let { gqlArgObj, canRunQuery } = generate_gqlArgObj([arg]);
                    console.log('-=-=-canRunQuery', canRunQuery);
                    if (canRunQuery == false) {
                        //will give off not good results for canRunQuery,must change handling in generate_gqlArgObj
                        group_canRunQuery = false;
                    }
                    return gqlArgObj[group.group_name];
                });
                group_gqlArgObj[group.group_name] = list;
                group_gqlArgObj = { ...group_gqlArgObj };
                console.log('list---', list);
            } else {
                let { gqlArgObj, canRunQuery } = generate_gqlArgObj(group_argumentsData);
                group_gqlArgObj = { ...group_gqlArgObj, ...gqlArgObj };
                if (canRunQuery == false) {
                    group_canRunQuery = false;
                }
            }
        }
    }



    let group_gqlArgObj_string = gqlArgObjToString(group_gqlArgObj)
    return {
        group_gqlArgObj,
        group_gqlArgObj_string,
        group_canRunQuery
    }
};