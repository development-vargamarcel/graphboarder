import { build_QMS_body, tableColsDataToQueryFields } from '$lib/utils/usefulFunctions';
import { derived } from 'svelte/store'

export const Create_QMS_body_StoreDerived = (_final_grqlArgObj_Store, _tableColsData_Store, QMS_type, QMS_name) => {
    return derived([_final_grqlArgObj_Store, _tableColsData_Store], ([$_final_grqlArgObj_Store, $_tableColsData_Store]) => {
        console.log({ $_final_grqlArgObj_Store }, $_tableColsData_Store)

        return build_QMS_body(
            QMS_name,
            tableColsDataToQueryFields($_tableColsData_Store),
            $_final_grqlArgObj_Store?.final_gqlArgObj_string, QMS_type);
    },)
}