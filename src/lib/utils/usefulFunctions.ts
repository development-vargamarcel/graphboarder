export const mandatoryArguments = (query) => {
    if (query?.args) {
        let mandatoryArgs = []
        mandatoryArgs = query?.args?.filter((arg) => {
            return arg?.type?.kind === "NON_NULL"
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
export const getQueryFromRootTypes = (rootTypes, queryNameForType) => {
    return rootTypes.filter((type) => {
        return type.name == queryNameForType;
    })[0];
}
export const getScalarFieldsNames = (query) => {
    let scalarFields = query?.fields?.filter((field) => {
        if (field?.type?.kind == 'SCALAR' || field.type?.ofType?.kind == 'SCALAR') {
            return true;
        }
    });
    let scalarFieldsNames = []
    if (scalarFields.length >= 1) {
        scalarFieldsNames = scalarFields?.map((field) => {
            return field?.name;
        });
    }
    return scalarFieldsNames
}