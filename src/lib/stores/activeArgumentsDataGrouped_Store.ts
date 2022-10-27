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
            activeArgumentsDataGrouped = activeArgumentsDataGrouped;
            //console.log('groupNewData.group_args', groupNewData.group_args);
            //console.log('activeArgumentsDataGrouped', activeArgumentsDataGrouped);
            set(activeArgumentsDataGrouped)
        }

    }
}
export const activeArgumentsDataGrouped_Store = Create_activeArgumentsDataGrouped_Store()