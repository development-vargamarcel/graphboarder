export const mandatoryArguments = (query) => {
    if (query?.args) {
        let mandatoryArgs = []
        mandatoryArgs = query?.args?.filter((arg) => {
            return arg?.type?.kind === "NON_NULL" || arg?.type?.name === "ID"
        })
        if (mandatoryArgs.length >= 1) {
            return mandatoryArgs
        } else {
            return false
        }


    } else { return { has: false }; }

}

export const scalarQueryFields_names = () => {

}
export const getQueryInfo = (queryFields, queryName) => {
    return queryFields.filter((queryField) => {
        return queryField.name == queryName;
    })[0];
}

export const getCurrentQueryNameForType = (queryInfo) => {
    return queryInfo?.type?.ofType?.name || queryInfo?.type?.name || queryInfo?.name;
}


export const getKindsArrayForType = (type) => {
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
export const getNamesArrayForType = (type) => {
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

export let getNameForType = (namesArray) => {
    return namesArray[namesArray.length - 1]
}

export let getNameToDisplay = (namesArray) => {
    return namesArray[0]
}
export const getQueryFromRootTypes = (rootTypes, queryNameForType) => {
    return rootTypes.filter((type) => {
        return type.name == queryNameForType;
    })[0];
}
export const getScalarFieldsNames = (query) => {
    let scalarFields = []
    scalarFields = query?.fields?.filter((field) => {
        let isSCALAR = false
        isSCALAR = field?.type?.kind == 'SCALAR' || field?.type?.ofType?.kind == 'SCALAR'
        if (isSCALAR) {
            return true;
        }
    });
    let scalarFieldsNames = []
    if (scalarFields?.length >= 1) {
        scalarFieldsNames = scalarFields?.map((field) => {
            return field?.name;
        });
    } else {
        scalarFieldsNames = []
    }
    return scalarFieldsNames
}