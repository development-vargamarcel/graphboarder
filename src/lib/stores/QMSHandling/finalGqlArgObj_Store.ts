import {
	generate_finalGqlArgObjAndCanRunQuery,
	generate_finalGqlArgObj_fromGroups,
	generate_group_gqlArgObjAndCanRunQuery_forHasOperators,
	generate_group_gqlArgObj
} from '$lib/utils/usefulFunctions';
import { writable, get } from 'svelte/store';
import type { ActiveArgumentsDataGroupedStore, ActiveArgumentGroup } from '$lib/types/index';
import { Logger } from '$lib/utils/logger';

export const Create_finalGqlArgObj_Store = (
	_activeArgumentsDataGrouped_Store: ActiveArgumentsDataGroupedStore,
	_paginationState_Store: any
) => {
	//rewrite,make it so that it always regenerates al groups when running without needing 'group'.
	const store = writable<any>({});
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		regenerate_groupsAndfinalGqlArgObj: () => {
			Logger.debug('Regenerating groups and final GraphQL argument object');
			const activeArgumentsDataGrouped = get(
				_activeArgumentsDataGrouped_Store
			) as ActiveArgumentGroup[];
			const finalGqlArgObjAndCanRunQuery = generate_finalGqlArgObjAndCanRunQuery(
				activeArgumentsDataGrouped,
				_paginationState_Store,
				true
			);
			if (finalGqlArgObjAndCanRunQuery.final_canRunQuery) {
				Logger.debug('Updating finalGqlArgObj', finalGqlArgObjAndCanRunQuery);
				set(finalGqlArgObjAndCanRunQuery);
			} else {
				Logger.warn(
					'Did not update finalGqlArgObj and final_canRunQuery because there was some error in arguments or query is not ready'
				);
			}
		}
	};
};
