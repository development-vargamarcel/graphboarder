import {
	build_QMS_bodyPart,
	gqlArgObjToString,
	tableColsDataToQueryFields,
} from '$lib/utils/usefulFunctions';
import { derived, get } from 'svelte/store';
import _ from 'lodash';

export const Create_QMS_bodyPart_StoreDerived = (
	finalGqlArgObj_Store,
	tableColsData_Store,
	QMS_type = 'query',
	QMS_name: string,
	paginationOptions_Store,
	paginationState_derived_Store, mergedChildren_finalGqlArgObj_Store, initialGqlArgObj = {}
) => {
	return derived(
		[finalGqlArgObj_Store, tableColsData_Store, paginationState_derived_Store, mergedChildren_finalGqlArgObj_Store],
		([$finalGqlArgObj_Store, $tableColsData_Store, , $mergedChildren_finalGqlArgObj_Store], set) => {
			let paginationState = {}
			if (paginationState_derived_Store?.get_value) {
				paginationState = paginationState_derived_Store?.get_value()
			}
			const get_QMS_args = () => {
				console.log({ initialGqlArgObj })
				// const merged = _.merge({}, initialGqlArgObj || {},
				// 	$finalGqlArgObj_Store?.finalGqlArgObj || {},
				// 	paginationState,
				// );
				const merged = _.merge({}, initialGqlArgObj || {},
					paginationState,
					$finalGqlArgObj_Store?.finalGqlArgObj || {},

				);
				return merged;
			}

			console.log('$mergedChildren_finalGqlArgObj_Store', $mergedChildren_finalGqlArgObj_Store)
			set(
				build_QMS_bodyPart(
					QMS_name,
					tableColsDataToQueryFields($tableColsData_Store),
					get_QMS_args(),
					QMS_type, $mergedChildren_finalGqlArgObj_Store
				)
			);
		}
	);
};
