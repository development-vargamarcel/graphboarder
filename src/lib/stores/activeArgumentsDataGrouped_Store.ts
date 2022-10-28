import { argumentCanRunQuery } from "$lib/utils/usefulFunctions";
import { get, writable } from "svelte/store";

export const Create_activeArgumentsDataGrouped_Store = () => {

    const store = writable([])
    const { subscribe, set, update } = store

    return {
        subscribe, set, update,
        set_groups: (activeArgumentsDataGrouped, argsInfo) => {
            console.log('-----------')
            //handle generating activeArgumentsDataGrouped
            const rootGroup = { group_name: 'root', group_isRoot: true, dd_kindList: false, group_args: [] };
            activeArgumentsDataGrouped = [rootGroup];

            argsInfo?.forEach((el) => {
                //console.log('el---', el);
                if (!el.dd_isRootArg) {
                    const newGroupData = {
                        group_name: el.dd_displayName,
                        group_isRoot: false,
                        // group_info: el,
                        ...el,
                        group_args: []
                    };

                    const hasFilterOperators = el.dd_relatedRoot?.dd_filterOperators?.length > 0;

                    if (hasFilterOperators) {
                        newGroupData.group_argsNode = {
                            mainContainer: {
                                operator: '_and',
                                isMain: true,
                                not: false,
                                items: [],
                                id: 'mainContainer'
                            }
                        };
                    }

                    activeArgumentsDataGrouped.push(newGroupData);
                    set(activeArgumentsDataGrouped)
                }
            });
        }, update_groups: (groupNewData) => {
            let activeArgumentsDataGrouped = get(store)
            console.log({ groupNewData });
            let index = activeArgumentsDataGrouped.findIndex((group) => {
                return group.group_name == groupNewData.group_name;
            });
            activeArgumentsDataGrouped[index] = groupNewData;
            set(activeArgumentsDataGrouped)
        }, update_activeArgument: (activeArgumentData, groupName
        ) => {
            let canRunQuery = argumentCanRunQuery(activeArgumentData)
            //     Object.assign(activeArgumentData, { canRunQueryabcdef: canRunQuery });
            activeArgumentData.canRunQueryabcdef = canRunQuery
            console.log('--', { activeArgumentData }, { canRunQuery })

            const activeArgumentsDataGrouped = get(store)
            const group = activeArgumentsDataGrouped?.filter((group) => { return group.group_name == groupName })

            const activeArgument = group.group_args?.filter((arg) => { return arg.id == activeArgumentData.id })
            console.log('--', { activeArgument })
            if (group.group_argsNode) {
                const activeArgumentNode = group.group_argsNode[activeArgumentData.id]
                if (activeArgumentNode) {
                    Object.assign(activeArgumentNode, activeArgumentData);
                }
                if (activeArgument) {

                    Object.assign(activeArgument, activeArgumentData);
                }
            } else {
                if (activeArgument) {

                    Object.assign(activeArgument, activeArgumentData);
                }
            }
            console.log("---", { activeArgumentsDataGrouped })
            set(activeArgumentsDataGrouped)
        }

    }
}
export const activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store()