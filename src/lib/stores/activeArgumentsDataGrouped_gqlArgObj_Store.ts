import { build_QMS_body, generate_FINAL_gqlArgObj_fromGroups, generate_gqlArgObj, generate_gqlArgObj_forHasOperators, tableColsDataToQueryFields } from "$lib/utils/usefulFunctions";
import { writable, get } from "svelte/store";
const generate_final_gqlArgObj_string = (activeArgumentsDataGrouped) => {
    let { final_gqlArgObj, final_gqlArgObj_string, final_canRunQuery } =
        generate_FINAL_gqlArgObj_fromGroups(activeArgumentsDataGrouped);
    if (final_canRunQuery) {
        return final_gqlArgObj_string
    }
};

export const Create_activeArgumentsDataGrouped_gqlArgObj_Store = (_activeArgumentsDataGrouped_Store) => {

    const store = writable({})
    const { subscribe, set, update } = store

    return {
        subscribe, set, update, updateGroup: (group) => {
            update((storeVal) => {
                console.log({ group })

                if (group.group_argsNode) {
                    storeVal[group.group_name] = generate_gqlArgObj_forHasOperators(
                        group.group_argsNode,
                        group.group_name
                    );
                } else {
                    storeVal[group.group_name] = generate_gqlArgObj(group.group_args)
                }
                return storeVal
            })


        }
    }
}
