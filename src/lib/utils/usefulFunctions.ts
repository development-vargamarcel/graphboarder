//QMS means QueryOrMutationOrSubscription
import _ from "lodash";
import { get } from 'svelte/store';
import { scalarsAndEnumsDisplayTypes } from '$lib/stores/scalarsAndEnumsDisplayTypes';
import { schemaData } from '$lib/stores/schemaData';
import { page } from '$app/stores';
import { displayStucture } from '$lib/stores/displayStructure';
export const build_QMS_body = (QMS_name, QMS_fields, QMS_args, QMS_type = 'query') => {
    if (QMS_fields.length == '') {
        console.error('no cols data,choose at least one field')
        return null
    }
    return `
    ${QMS_type}{
  ${QMS_name}${QMS_args ? `(${QMS_args})` : ''}{
${QMS_fields}
  }
}
`;
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









//colData must become colInfo everywhere,for less ambiguity
export const getColResultData = (colData, row_resultData) => {
    //col data is column info like colData.stepsOfFields,not the result's column data
    let stepsOfFields = colData.stepsOfFields;
    let colResultData;

    const handleArray = (array, element) => {
        array = array.map((subElement) => {
            if (subElement?.[element] !== undefined) {
                return subElement[element];
            } else if (typeof subElement == 'object' && subElement.length > 0) {
                return handleArray(subElement, element);
            } else {
                return [];
            }
            // return subElement[element]
        });
        return array;
    };


    stepsOfFields.forEach((element) => {
        if (typeof element == 'string') {
            if (colResultData?.length > 0) {
                //is array

                let handleArrayResult = handleArray(colResultData, element);
                colResultData = handleArrayResult;

            } else if (colResultData?.length == 0) {
                //do nothing in this case

            } else if (colResultData !== undefined) {
                //is not array but is defined

                if (colResultData?.[element] !== undefined) {
                    colResultData = colResultData[element];

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

                        colResultData = row_resultData;

                    } else if (colResultData?.length == 0) {
                        //do nothing in this case

                    }
                } else if (typeof row_resultData == 'number') {
                    colResultData = row_resultData;
                } else {

                }
            }
        }

    });
    return colResultData;
};

export const getData = (row, colData, index) => {
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

export const get_idFields_byProbability = (fields: Array<object>): Array<object> => {
    let filteredFields = fields.filter((field) => {
        //keep in mind that a field can be an id field even if "field.dd_NON_NULL" is false
        return field.dd_NON_NULL && !field.dd_kindList && field.dd_kindEl == 'SCALAR' || field?.dd_rootName == 'ID';
    })
    if (filteredFields.length > 0) {
        return filteredFields
    } else {
        return fields
    }
}


export const get_displayType = (dd_rootName, dd_kindEl) => {
    let _scalarsAndEnumsDisplayTypes = get(scalarsAndEnumsDisplayTypes);
    let displayType = _scalarsAndEnumsDisplayTypes[dd_rootName];
    if (displayType == undefined) {
        displayType = _scalarsAndEnumsDisplayTypes[dd_kindEl];

    }
    return displayType
}
export const get_displayStructure = (rootName) => {

    let _displayStructure = get(displayStucture);
    let displayStructure = _displayStructure[rootName];
    return displayStructure
}
export const generate_derivedData = (type, rootTypes, isQMSField) => { //type/field  
    let derivedData = { ...type }
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


    let displayType = get_displayType(derivedData.dd_rootName, derivedData.dd_kindEl) //change displayType to displayInterface
    if (["text", undefined].includes(derivedData.dd_displayType)) {
        derivedData.dd_displayType = displayType
    }
    if (!derivedData.dd_displayStructure) {
        derivedData.dd_displayStructure = get_displayStructure(derivedData.dd_rootName)
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

    derivedData.dd_shouldExpand = derivedData.dd_canExpand && !derivedData.dd_relatedRoot?.enumValues
    derivedData.dd_isQMSField = isQMSField ? true : false
    derivedData.dd_get_idFields_byProbability = function () {
        if (this.fields) {
            return get_idFields_byProbability(this.fields)
        } else {
            return []
        }
    }
    derivedData.dd_idFields_byProbability = derivedData.dd_get_idFields_byProbability()
    derivedData.dd_castType = 'implement this.possible values:string,number,graphqlGeoJson...' //example of why:date can be expected as timestamptz ("2016-07-20T17:30:15+05:30"),but must be casted as string
    derivedData.dd_derivedTypeBorrowed = 'implement this? maybe not?'
    ////////// others
    if (derivedData?.dd_filterOperators) {

        let defaultDisplayType = get_displayType(derivedData.dd_rootName)
        let defaultDisplayStructure = get_displayStructure(derivedData.dd_rootName)
        if (type?.inputFields !== undefined) {
            derivedData.dd_filterOperatorsDefaultDisplayType = defaultDisplayType
            derivedData.dd_filterOperatorsDefaultDisplayStructure = defaultDisplayStructure
            type.inputFields.forEach(inputField => {
                Object.assign(inputField, { dd_displayType: defaultDisplayType, dd_displayStructure: defaultDisplayStructure })

            })

        }





    }





    return derivedData

}



export const generate_gqlArgObj = (group_argumentsData) => {

    // check for group if expects list and treat it accordingly like here --->https://stackoverflow.com/questions/69040911/hasura-order-by-date-with-distinct
    let gqlArgObj = {};
    let canRunQuery = true;
    group_argumentsData.forEach((argData) => {
        if (argData.inUse) {
            let { chd_chosen, chd_dispatchValue, chd_needsValue, chd_needsChosen, stepsOfFields } =
                argData;

            let curr_gqlArgObj = gqlArgObj;
            stepsOfFields.forEach((step, index) => {
                let isLast = index == stepsOfFields.length - 1;
                if (isLast) {
                    if (!chd_needsChosen) {
                        if (!curr_gqlArgObj?.[step]) {
                            curr_gqlArgObj[step] = chd_dispatchValue;
                        }
                        curr_gqlArgObj = curr_gqlArgObj[step];
                    } else {
                        if (chd_needsValue == undefined) {
                            canRunQuery = false;
                        } else if (!chd_needsValue) {
                            curr_gqlArgObj[step] = chd_chosen;
                            if (!(Array.isArray(chd_chosen) || typeof chd_chosen == 'string')) {
                                canRunQuery = false;
                            }
                        } else {

                            if (!curr_gqlArgObj?.[step]) {
                                curr_gqlArgObj[step] = {};
                            }
                            curr_gqlArgObj = curr_gqlArgObj[step];

                            curr_gqlArgObj[chd_chosen] =
                                chd_dispatchValue !== undefined ? chd_dispatchValue : '';
                            curr_gqlArgObj = curr_gqlArgObj[chd_chosen];

                            if (chd_dispatchValue == undefined) {
                                canRunQuery = false;
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

            if (chd_chosen == undefined &&
                chd_dispatchValue == undefined &&
                chd_needsValue == undefined &&
                chd_needsChosen == undefined) {
                canRunQuery = false;
            }

        }
    });


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




export const generate_group_gqlArgObj = (group) => {//if is where/filter (its related_root has filter_operators  ,like __or,__and,_not) handle differently after implementing the new ui
    let group_gqlArgObj = {};
    let group_canRunQuery = group.group_args.every((arg) => {
        return arg.canRunQuery
    })
    let group_argumentsData = group.group_args.filter((arg) => {
        return arg.inUse;
    });

    if (group_argumentsData?.length > 0) {

        if (group.group_isRoot) {
            //console.log('root group handled');
            let { gqlArgObj } = generate_gqlArgObj(group_argumentsData);
            group_gqlArgObj = { ...group_gqlArgObj, ...gqlArgObj };

        } else {
            //console.log('NON root group handled');
            if (group.dd_kindList) {
                let list = [];
                list = group_argumentsData.map((arg) => {
                    let { gqlArgObj } = generate_gqlArgObj([arg]);

                    return gqlArgObj[group.group_name];
                });
                group_gqlArgObj[group.group_name] = list;
                group_gqlArgObj = { ...group_gqlArgObj };
                //console.log('list---', list);
            } else {
                let { gqlArgObj } = generate_gqlArgObj(group_argumentsData);
                group_gqlArgObj = { ...group_gqlArgObj, ...gqlArgObj };

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

//sss
/////
const validItems = (items, nodes) => {
    return items.filter((item) => {
        let itemData = nodes[item.id];

        return itemData.inUse || (itemData.operator && validItems(itemData.items, nodes).length > 0);
    });
};



//
const generate_gqlArgObjForItems = (items, group_name, nodes) => {
    //!!! this must be modified: example bug: _st_d_within has distance and from as dd_NON_NULL,you must combine the result in one object not two objects in an array,even if in _or.
    let itemsObj = items.map((item) => {
        let itemData = nodes[item.id];

        let itemObj = {};
        let itemObjCurr = {};
        //
        if (itemData.not) {
            itemObj['_not'] = {};
            itemObjCurr = itemObj['_not'];
        } else {
            itemObjCurr = itemObj;
        }
        //
        //console.log({ itemObj });
        if (itemData.operator) {
            let validItemsResult = validItems(itemData.items, nodes)
            console.log({ validItemsResult })
            if (itemData?.isBond) {
                let arrayOfObjects = validItemsResult.map((item) => {
                    return nodes[item.id].arg_gqlArgObj
                })
                console.log({ arrayOfObjects })
                let mergeResult = {}
                _.merge(mergeResult, ...arrayOfObjects)
                Object.assign(itemObjCurr,
                    mergeResult[group_name]
                );
                console.log({ mergeResult })
                console.log({ itemData })
            } else {
                Object.assign(itemObjCurr, {
                    [itemData.operator]: generate_gqlArgObjForItems(
                        validItemsResult,
                        group_name,
                        nodes
                    )
                });
            }

        } else {
            //console.log('arg');
            //console.log('group_name', group_name);
            Object.assign(itemObjCurr, nodes[item.id]?.gqlArgObj?.[group_name]);
        }
        //
        return itemObj;
    });
    return itemsObj;
};
//
export const generate_gqlArgObj_forHasOperators = (group) => {
    let { group_argsNode, group_name } = group
    let group_gqlArgObj = { [group_name]: { _and: [] } };
    let group_canRunQuery = true;
    let nodes = JSON.parse(JSON.stringify(group_argsNode));
    let nodesArray = Object.values(nodes);
    let mainContainer = nodesArray.filter((node) => {
        return node.isMain;
    })[0];
    //

    group_gqlArgObj[group_name]['_and'] = generate_gqlArgObjForItems(
        validItems(mainContainer?.items, nodes),
        group_name,
        nodes
    );
    if (group_gqlArgObj[group_name]['_and']?.length == 0) {
        group_canRunQuery = false;
        group_gqlArgObj = {}
    }


    //



    let group_gqlArgObj_string = gqlArgObjToString(group_gqlArgObj)
    return {
        group_gqlArgObj,
        group_gqlArgObj_string,
        group_canRunQuery
    }
};
////

export const generate_FINAL_gqlArgObj_fromGroups = (activeArgumentsDataGrouped) => {
    let final_gqlArgObj = {};
    let final_canRunQuery = true
    activeArgumentsDataGrouped.forEach((group) => {
        Object.assign(final_gqlArgObj, group.group_gqlArgObj);
    })
    let final_gqlArgObj_string = gqlArgObjToString(final_gqlArgObj)

    return { final_gqlArgObj, final_gqlArgObj_string, final_canRunQuery }
};




export const getQueryLinks = () => {
    let $page = get(page)
    let origin = $page.url.origin;
    let queryLinks = []
    let $schemaData = get(schemaData)
    queryLinks = $schemaData.queryFields.map((query) => {
        let queryName = query.name;
        let queryNameDisplay = queryName;
        let queryTitleDisplay = '';
        let currentQueryFromRootTypes = query.dd_relatedRoot;
        let { scalarFields, non_scalarFields } = getFields_Grouped(currentQueryFromRootTypes);
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
        let queryLink = { url: `/queries/${queryName}`, title: queryNameDisplay }
        return queryLink
    })
    return queryLinks
}


////////////////////////



export const convertTo_displayStructure = (displayStructure, value) => {
    let converters = {
        ISO8601: (date) => {
            let date_ISO8601 = new Date(date).toISOString();

            return `'${date_ISO8601}'`;
        }
    }
    let convertingFunction = converters?.[displayStructure]
    if (convertingFunction) {
        return convertingFunction(value)
    }
    console.log('no converting function available for:', displayStructure, ',returning value as is.');
    return value
}
//console.log(convertTo_displayStructure('ISO86012', '2020-08-02T00:00:00'))
export const stepsOfFieldsToQueryFragmentObject = (stepsOfFields) => {
    let stepsOfFields_length = stepsOfFields.length
    let queryObject = {}
    let queryObjectCurrLevel = queryObject
    stepsOfFields.forEach((fieldName, index) => {
        if (stepsOfFields_length == index + 1) {
            queryObjectCurrLevel[fieldName] = "novaluehere"
        } else {
            queryObjectCurrLevel[fieldName] = {}
            queryObjectCurrLevel = queryObjectCurrLevel[fieldName]
        }
    });
    return queryObject
}

export const tableColsDataToQueryFields = (tableColsData) => {
    if (tableColsData.length == '') {
        return ``
    }
    let queryFragmentsObjects = tableColsData
        .filter((colData) => {
            return colData.queryFragmentObject !== undefined;
        })
        .map((colData) => {
            return colData.queryFragmentObject;
        });
    const _queryFragmentsObjects = JSON.parse(JSON.stringify(queryFragmentsObjects))

    const merged = _.merge(..._queryFragmentsObjects);
    const stringified = JSON.stringify(merged);
    const queryFragments = stringified.replaceAll(/novaluehere|"|:/gi, '').slice(1, -1);
    return queryFragments
}

export const argumentCanRunQuery = (arg) => {
    if (!arg.inUse) {
        return true
    }
    if (arg.chd_needsChosen && arg.chd_chosen.length == 0) {
        return false
    }
    if (arg.chd_needsValue && typeof arg.chd_dispatchValue == undefined) {
        return false
    }
    return true
}