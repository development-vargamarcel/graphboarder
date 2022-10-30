import { build_QMS_body, generate_FINAL_gqlArgObj_fromGroups, tableColsDataToQueryFields } from "$lib/utils/usefulFunctions";
import { writable, get } from "svelte/store";
const generate_final_gqlArgObj_string = (activeArgumentsDataGrouped) => {
    let { final_gqlArgObj, final_gqlArgObj_string, final_canRunQuery } =
        generate_FINAL_gqlArgObj_fromGroups(activeArgumentsDataGrouped);
    if (final_canRunQuery) {
        return final_gqlArgObj_string
    }
};

export const Create_QMS_body_Store = (_tableColsData_Store, _activeArgumentsDataGrouped_Store, QMS_type, QMS_name) => {

    const store = writable({ QMS_body: '' })
    const { subscribe, set, update } = store

    return {
        subscribe, set, update, generateQMS: () => {
            update(() => {
                let QMS_body = build_QMS_body(
                    QMS_name,
                    tableColsDataToQueryFields(get(_tableColsData_Store)),
                    generate_final_gqlArgObj_string(get(_activeArgumentsDataGrouped_Store))
                );
                return { QMS_body }
            })

        }
    }
}
