import {
	generate_finalGqlArgObj_fromGroups,
	generate_gqlArgObj_forHasOperators,
	generate_group_gqlArgObj,
} from '$lib/utils/usefulFunctions';
import { writable, get } from 'svelte/store';

export const Create_finalGqlArgObj_Store = (
	_activeArgumentsDataGrouped_Store,
	_paginationState_Store
) => {
	//rewrite,make it so that it always regenerates al groups when running without needing 'group'.
	const store = writable({});
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		regenerate_groupsAndfinalGqlArgObj: () => {
			//reset pagination state too !!!THIS MIGHT TRIGGER 1 EXTRA SERVER REQUEST,seems not from what i saw
			_paginationState_Store.resetToDefault();
			//
			console.log('regenerate_groupsAndfinalGqlArgObj RUN');
			let groups_gqlArgObj = get(_activeArgumentsDataGrouped_Store).map((group) => {
				if (group.group_argsNode) {
					return generate_gqlArgObj_forHasOperators(group);
				} else {
					return generate_group_gqlArgObj(group);
				}
			});
			let { finalGqlArgObj, final_canRunQuery } =
				generate_finalGqlArgObj_fromGroups(groups_gqlArgObj);

			//better set an array?
			if (final_canRunQuery) {
				set({ finalGqlArgObj, final_canRunQuery });
			}
		}
	};
};
