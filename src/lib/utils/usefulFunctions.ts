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

    rootField.fields.forEach(field => {
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
    console.log('aaaa', colData, row_resultData)
    let stepsOfFieldsNew = colData.stepsOfFieldsNew
    let colResultData




    console.log('qqq start', stepsOfFieldsNew)
    stepsOfFieldsNew.forEach(element => {
        if (typeof element == 'string') {


            if (colResultData?.length) { //is array
                colResultData = colResultData.map((subElement) => {
                    return subElement[element]
                })
            } else if (colResultData !== undefined) {//is not array but is defined
                if (colResultData?.[element]) {
                    colResultData = colResultData[element]
                }

            } else { //is undefined
                if (row_resultData?.[element] !== undefined) {
                    colResultData = row_resultData[element]
                } else {
                    //colResultData = 'unknown do some research'
                }
            }

        }
        console.log('qqq----', colResultData)
    })

    return colResultData
}