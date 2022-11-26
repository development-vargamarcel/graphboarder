import { generate_FINAL_gqlArgObj_fromGroups, generate_gqlArgObj, generate_gqlArgObj_forHasOperators, generate_group_gqlArgObj, tableColsDataToQueryFields } from "$lib/utils/usefulFunctions";
import { writable, get } from "svelte/store";


export const Create_final_gqlArgObj_Store = (_activeArgumentsDataGrouped_Store, _pagination_state_Store) => {
    //rewrite,make it so that it always regenerates al groups when running without needing 'group'.
    const store = writable({})
    const { subscribe, set, update } = store

    return {
        subscribe, set, update, regenerate_groupsAndfinal_gqlArgObj: () => {
            //reset pagination state too
            _pagination_state_Store.resetToDefault()
            //
            console.log('regenerate_groupsAndfinal_gqlArgObj RUN')
            let groups_gqlArgObj = get(_activeArgumentsDataGrouped_Store).map((group) => {
                if (group.group_argsNode) {
                    return generate_gqlArgObj_forHasOperators(group);
                } else {
                    return generate_group_gqlArgObj(group)
                }
            })
            let { final_gqlArgObj, final_gqlArgObj_string, final_canRunQuery } =
                generate_FINAL_gqlArgObj_fromGroups(groups_gqlArgObj)

            //better set an array?
            set({ final_gqlArgObj, final_gqlArgObj_string, final_canRunQuery })
        }
    }
}
