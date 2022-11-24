import { build_QMS_bodyPart, tableColsDataToQueryFields } from '$lib/utils/usefulFunctions';
import { derived, get } from 'svelte/store'
import { schemaData } from '$lib/stores/schemaData';


export const Create_QMS_bodyPart_StoreDerived = (_final_grqlArgObj_Store, _tableColsData_Store, QMS_type, QMS_name, offsetBasedPaginationOptions_Store) => {



    return derived([_final_grqlArgObj_Store, _tableColsData_Store], ([$_final_grqlArgObj_Store, $_tableColsData_Store], set) => {
        let QMS_Info = schemaData.get_QMS_Field(QMS_name, QMS_type);
        let offsetName = QMS_Info?.offsetPaginationArgs.offsetArg.dd_displayName
        let currentOffset = $_final_grqlArgObj_Store?.final_gqlArgObj?.[offsetName]
        if (QMS_Info?.paginationType == "offsetBased" && get(offsetBasedPaginationOptions_Store)?.infiniteScroll) {
            let lastOffset
            console.log({ lastOffset })
            if (lastOffset == null || currentOffset != 0) {
                set(build_QMS_bodyPart(
                    QMS_name,
                    tableColsDataToQueryFields($_tableColsData_Store),
                    $_final_grqlArgObj_Store?.final_gqlArgObj_string, QMS_type))
                lastOffset = currentOffset
            } else {
                lastOffset = null
            }
        } else {
            set(build_QMS_bodyPart(
                QMS_name,
                tableColsDataToQueryFields($_tableColsData_Store),
                $_final_grqlArgObj_Store?.final_gqlArgObj_string, QMS_type))
        }




    },)
}