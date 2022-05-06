//QM means QueryOrMutation

export const buildQueryBody = (queryName, queryFragments) => {
    return `
    query MyQuery {
  ${queryName} {
${queryFragments}
  }
}
    `
}



export const generateFragmentData = (field, rootTypes, flatten, deeperIfNoScalar = true) => {

    let fieldName = field.name;
    let isScalar = getRootType_KindsArray(field).includes('SCALAR');
    let fragmentData
    let subFields
    let subFields_scalar

    if (isScalar) {
        if (flatten) {
            fragmentData = fieldName
        } else {
            fragmentData = [fieldName]
        }



    } else {
        fragmentData = [fieldName]
        subFields = getRootType(
            rootTypes,
            getRootType_Name(getRootType_NamesArray(field))
        ).fields
        subFields_scalar = subFields
            .filter((subField) => {
                return getRootType_KindsArray(subField).includes('SCALAR');
            })






        if (flatten) {
            if (subFields_scalar.length > 0) {
                fragmentData.push(
                    subFields_scalar.map((subField) => {
                        return subField.name;
                    }))
            } else {
                if (deeperIfNoScalar) {
                    console.log('subFields', subFields)
                    fragmentData.push(
                        subFields.map((subField) => {
                            return generateFragmentData(subField, rootTypes, true, true)
                        }))

                } else {
                    return undefined
                }

            }

        } else {
            fragmentData.push(subFields)
        }




    }
    return fragmentData
}



export const fragmentDataToFragment = (fragmentData) => { //accepts an array,so to be sure put input between [], ex:fragmentDataToFragment([input])
    let res
    if (typeof fragmentData == 'string') {
        res = fragmentData
    } else {
        res = fragmentData.map((el) => {
            if (typeof el == 'string') {
                return el
            } else {
                return [el[0], '\n{', fragmentDataToFragment(el[1]), '}\n']

            }
        })
    }
    return res
}

export const generateQueryFragments = (tableColsData = []) => {
    let body = ``
    let queryFragment
    tableColsData.forEach((colData) => {
        queryFragment = colData?.queryFragment
        if (typeof queryFragment == 'string') {
            body = body + `\n ${queryFragment}`
        } else {
            body = body + `\n ${fragmentDataToFragment([queryFragment])}`

        }
    })

    return body
}

export const getQM_mandatoryArguments = (QM) => { //QM means QueryOrMutation
    if (QM?.args) {
        let mandatoryArgs = []
        mandatoryArgs = QM?.args?.filter((arg) => {
            return arg?.type?.kind === "NON_NULL" || arg?.type?.name === "ID"
        })
        if (mandatoryArgs.length >= 1) {
            return mandatoryArgs
        } else {
            return false
        }


    } else { return { has: false }; }

}


export const getQM_Field = (QMFields, queryName) => { //QM means QueryOrMutation
    return QMFields.filter((field) => {
        return field.name == queryName;
    })[0];
}


export const getRootType_KindsArray = (type) => {
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

    return kinds
}
export const getRootType_NamesArray = (type) => {
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
    return names
}

export let getRootType_Name = (namesArray) => {
    return namesArray[namesArray.length - 1]
}

export let getDisplay_Name = (namesArray) => {
    return namesArray[0]
}
export const getRootType = (rootTypes, RootType_Name) => {
    return rootTypes.filter((type) => {
        return type.name == RootType_Name;
    })[0];
}


export const getFields_Grouped = (rootField) => {
    let scalarFields = []
    let non_scalarFields = []

    rootField?.fields?.forEach(field => {
        if (getRootType_KindsArray(field).includes('SCALAR')) {
            scalarFields.push(field)
        } else {
            non_scalarFields.push(field)

        }
    });

    return {
        scalarFields: scalarFields, non_scalarFields: non_scalarFields
    }
}

// export const getArguments_Grouped = (QM) => {
//     let scalarArgs = []
//     let non_scalarArgs = []
//     console.log(QM)
//     console.log(QM.args)
//     QM?.args?.forEach(arg => {
//         if (getRootType_KindsArray(arg).includes('SCALAR')) {
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
            arg: arg
            , kindsArray: getRootType_KindsArray(arg)
        }
    })
    return args
}


export const stepsOfFieldsToColData = (stepsOfFields) => {
    let colData
    if (stepsOfFields.length == 1) {
        colData = stepsOfFields[0][0]

    } else {
        let stepsOfFields_Len = stepsOfFields.length
        for (let i = stepsOfFields_Len; i > 0; i--) {

            if (colData) {
                if (i > 1) {
                    colData = [[...stepsOfFields[i - 1], colData]]
                } else {
                    colData = [...stepsOfFields[i - 1], colData]
                }
            } else {


                colData = [...stepsOfFields[i - 1]]


                // if (typeof stepsOfFields[i - 1] == 'string') {
                //     colData = [...stepsOfFields[i - 1]]
                // } else {

                //     colData = [...stepsOfFields[i - 1]]//change
                // }
            }

        }
    }

    return colData
}

export const stepsOfFieldsToQueryFragment = (stepsOfFields) => {
    let queryFragment

    if (typeof stepsOfFields[stepsOfFields.length - 1][0] == 'string') {
        queryFragment = `${stepsOfFields.join('{')}${'}'.repeat(stepsOfFields.length - 1)}`
    } else {
        //here you must handle the situation where the selected data for column doesn't have direct scalar fields
    }




    return queryFragment
}

//colData must become colInfo everywhere,for less ambiguity
export const getColResultData = (colData, row_resultData) => { //col data is column info like colData.stepsOfFieldsNew,not the result's column data
    // console.log('getColResultData start here', colData, row_resultData)
    let stepsOfFieldsNew = colData.stepsOfFieldsNew
    let colResultData

    const handleArray = (array, element) => {
        // console.log('handleArray array, element ', array, element)
        array = array.map((subElement) => {
            //  console.log('subElement?.[element]', subElement?.[element])
            if (subElement?.[element] !== undefined) {
                //   console.log('subElement?.[element] !== undefined')
                return subElement[element]
            } else if (typeof subElement == 'object' && subElement.length > 0) {
                //  console.log('typeof subElement == object && subElement.length > 0')
                return handleArray(subElement, element)
            }
            else {
                return []
            }
            // return subElement[element]
        })
        return array
    }


    // console.log('qqq start stepsOfFieldsNew', stepsOfFieldsNew)

    stepsOfFieldsNew.forEach(element => {
        //  console.log('qqq start colResultData element', colResultData, element)
        if (typeof element == 'string') {
            if (colResultData?.length > 0) { //is array
                // console.log('---------array')
                let handleArrayResult = handleArray(colResultData, element)
                // console.log('handleArrayResult', handleArrayResult, JSON.stringify(handleArrayResult))
                colResultData = handleArrayResult

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
            } else if (colResultData !== undefined) {//is not array but is defined
                // console.log('----------------')
                if (colResultData?.[element] !== undefined) {
                    colResultData = colResultData[element]
                    // console.log('===================')
                } else {//? may cause problems
                    colResultData = null//? may cause problems
                }//? may cause problems

            } else { //is undefined
                if (row_resultData?.[element] !== undefined) {
                    colResultData = row_resultData[element]
                } else if (typeof row_resultData == 'object') {
                    if (row_resultData?.length > 0) { //is array
                        // console.log('is undefined --> ---------array')
                        colResultData = row_resultData
                        // .map((subElement) => {
                        //     return subElement?.[element]
                        // })
                    } else if (colResultData?.length == 0) {
                        //do nothing in this case
                        //  console.log('colResultData?.length == 0')
                    }

                } else if (typeof row_resultData == 'number') {
                    colResultData = row_resultData
                }
                else {
                    //console.log('row_resultData', row_resultData)
                    // console.log('+++++')
                    //colResultData = 'unknown do some research'
                }
            }

        }

        // console.log('qqq end colResultData', colResultData)
    })
    // console.log('end all colResultData', colResultData)
    return colResultData
}



export const getData = (row, colData, index) => {
    let dateNow = (new Date())
    // console.log('*******************************************************')
    // console.log('aaaa getColResultData', dateNow);
    //console.log('data = row', row);

    let data;
    if (row) {
        if (row[index] !== undefined) {//row[index] //Not good,causes problems when two or more fields share fields,because in the results they will have data under the same column
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
