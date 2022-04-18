//QM means QueryOrMutation

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
export const getRootType = (rootTypes, queryNameForType) => {
    return rootTypes.filter((type) => {
        return type.name == queryNameForType;
    })[0];
}


export const getFields_Grouped = (QM) => {
    let scalarFields = []
    let non_scalarFields = []

    QM.fields.forEach(field => {
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

export const getArguments_Grouped = (QM) => {
    let scalarArgs = []
    let non_scalarArgs = []
    console.log(QM)
    console.log(QM.args)
    QM?.args?.forEach(arg => {
        if (getRootType_KindsArray(arg).includes('SCALAR')) {
            scalarArgs.push(arg)
        } else {
            non_scalarArgs.push(arg)

        }
    });

    return {
        scalarArgs: scalarArgs, non_scalarArgs: non_scalarArgs
    }
}