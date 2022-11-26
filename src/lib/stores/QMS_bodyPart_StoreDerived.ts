import { build_QMS_bodyPart, gqlArgObjToString, tableColsDataToQueryFields } from '$lib/utils/usefulFunctions';
import { derived } from 'svelte/store'
import _ from "lodash";

export const Create_QMS_bodyPart_StoreDerived = (_final_grqlArgObj_Store, _tableColsData_Store, QMS_type = 'query', QMS_name: string, offsetBasedPaginationOptions_Store, _pagination_state_Store) => {



    return derived([_final_grqlArgObj_Store, _tableColsData_Store, _pagination_state_Store], ([$_final_grqlArgObj_Store, $_tableColsData_Store, $_pagination_state_Store], set) => {

        const merged = _.merge($_final_grqlArgObj_Store?.final_gqlArgObj, $_pagination_state_Store)
        const QMS_args = gqlArgObjToString(merged)
        set(build_QMS_bodyPart(
            QMS_name,
            tableColsDataToQueryFields($_tableColsData_Store),
            QMS_args, QMS_type))

    },)
}