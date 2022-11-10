import { build_QMS_bodyPart, tableColsDataToQueryFields } from '$lib/utils/usefulFunctions';
import { derived } from 'svelte/store'

export const Create_QMS_bodyPart_StoreDerived = (_final_grqlArgObj_Store, _tableColsData_Store, QMS_type, QMS_name) => {
    return derived([_final_grqlArgObj_Store, _tableColsData_Store], ([$_final_grqlArgObj_Store, $_tableColsData_Store]) => {
        return build_QMS_bodyPart(
            QMS_name,
            tableColsDataToQueryFields($_tableColsData_Store),
            $_final_grqlArgObj_Store?.final_gqlArgObj_string, QMS_type);
    },)
}