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
			const activeArgumentsDataGrouped = get(_activeArgumentsDataGrouped_Store);
			const finalGqlArgObjAndCanRunQuery = generate_finalGqlArgObjAndCanRunQuery(activeArgumentsDataGrouped, _paginationState_Store, true)
			if (finalGqlArgObjAndCanRunQuery.final_canRunQuery) {
				set(finalGqlArgObjAndCanRunQuery);
			} else {
				console.log('Did not update finalGqlArgObj and final_canRunQuery because there was some error in arguments')
			}
		}
	};
};

const generate_finalGqlArgObjAndCanRunQuery = (activeArgumentsDataGrouped, _paginationState_Store, resetPaginationState = true) => {
	//reset pagination state too !!!THIS MIGHT TRIGGER 1 EXTRA SERVER REQUEST,seems not from what i saw
	if (resetPaginationState) {
		_paginationState_Store.resetToDefault();
	}
	//
	console.log('regenerate_groupsAndfinalGqlArgObj RUN');
	const groups_gqlArgObj = activeArgumentsDataGrouped.map((group) => {
		if (group.group_argsNode) {
			return generate_gqlArgObj_forHasOperators(group);
		} else {
			return generate_group_gqlArgObj(group);
		}
	});
	return generate_finalGqlArgObj_fromGroups(groups_gqlArgObj);
	//better set an array?
}
