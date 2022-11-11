import { argumentCanRunQuery, generate_gqlArgObj } from "$lib/utils/usefulFunctions";
import { json } from "@sveltejs/kit";
import { get, writable } from "svelte/store";

export const Create_activeArgumentsDataGrouped_Store = () => {

    const store = writable([])
    const { subscribe, set, update } = store

    return {
        subscribe, set, update,
        set_groups: (argsInfo) => {
            //handle generating activeArgumentsDataGrouped
            const rootGroup = { group_name: 'root', group_isRoot: true, dd_kindList: false, group_args: [] };
            let activeArgumentsDataGrouped = [rootGroup];

            argsInfo?.forEach((el) => {
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

                }
            });

            set(activeArgumentsDataGrouped)
        }, update_groups: (groupNewData) => {
            update((activeArgumentsDataGrouped) => {
                let index = activeArgumentsDataGrouped.findIndex((group) => {
                    return group.group_name == groupNewData.group_name;
                });
                activeArgumentsDataGrouped[index] = groupNewData;
                return activeArgumentsDataGrouped
            })

        }, update_activeArgument: (activeArgumentData, groupName
        ) => {
            update(
                (activeArgumentsDataGrouped) => {
                    const gqlArgObj = generate_gqlArgObj([activeArgumentData])
                    const canRunQuery = argumentCanRunQuery(activeArgumentData)
                    Object.assign(activeArgumentData, { ...gqlArgObj, canRunQuery });
                    const group = activeArgumentsDataGrouped?.filter((group) => { return group.group_name == groupName })
                    const activeArgument = group.group_args?.filter((arg) => { return arg.id == activeArgumentData.id })
                    const activeArgumentNode = group?.group_argsNode?.[activeArgumentData.id]
                    if (activeArgumentNode) {
                        Object.assign(activeArgumentNode, activeArgumentData);
                    }
                    if (activeArgument) {
                        Object.assign(activeArgument, activeArgumentData);
                    }

                    return activeArgumentsDataGrouped
                }
            )

        },
        delete_activeArgument: (activeArgumentData, groupName) => {
            update(
                (activeArgumentsDataGrouped) => {
                    let group = activeArgumentsDataGrouped?.filter((group) => { return group.group_name == groupName })[0]
                    const activeArgumentIndex = group.group_args?.findIndex((arg) => { return arg.id == activeArgumentData.id })
                    if (group.group_argsNode) {
                        let containers = Object.values(group.group_argsNode).filter((container) => {
                            return container?.items
                        })
                        let argumentContainerId = containers.find((container) => { return container.items.find((item) => { return item.id == activeArgumentData.id }) }).id
                        if (argumentContainerId) {
                            group.group_argsNode[argumentContainerId].items = group.group_argsNode[argumentContainerId].items.filter((item) => { return item.id != activeArgumentData.id })
                        }

                        if (activeArgumentIndex) {
                            group.group_args.splice(activeArgumentIndex, 1)
                        }
                    } else {
                        group.group_args.splice(activeArgumentIndex, 1)
                    }
                    return activeArgumentsDataGrouped
                })
        }, get_activeArgument: (stepsOfFields, group_name = 'root') => {
            const storeValue = get(store)
            return storeValue.find(
                (group) => {
                    return group.group_name == group_name;
                }
            )?.group_args?.find((arg) => { return arg.stepsOfFieldsStringified == JSON.stringify(stepsOfFields) });

        }

    }
}
