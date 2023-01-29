import {
	build_QMS_bodyPart,
	gqlArgObjToString,
	tableColsDataToQueryFields
} from '$lib/utils/usefulFunctions';
import { derived, get } from 'svelte/store';
import _ from 'lodash';

export const Create_QMS_bodyPart_StoreDerived = (
	finalGqlArgObj_Store,
	tableColsData_Store,
	QMS_type = 'query',
	QMS_name: string,
	paginationOptions_Store,
	paginationState_derived_Store,
) => {
	return derived(
		[finalGqlArgObj_Store, tableColsData_Store, paginationState_derived_Store],
		([$finalGqlArgObj_Store, $tableColsData_Store], set) => {
			let paginationState
			if (paginationState_derived_Store?.get_value) {
				paginationState = paginationState_derived_Store?.get_value()
			}
			const get_QMS_args = () => {
				if (paginationState_derived_Store) {
					const merged = _.merge({},
						$finalGqlArgObj_Store?.finalGqlArgObj,
						paginationState
					);
					return gqlArgObjToString(merged);

				}
				if ($finalGqlArgObj_Store?.finalGqlArgObj) {
					return gqlArgObjToString($finalGqlArgObj_Store?.finalGqlArgObj)
				}
				return ''
			}


			set(
				build_QMS_bodyPart(
					QMS_name,
					tableColsDataToQueryFields($tableColsData_Store),
					get_QMS_args(),
					QMS_type
				)
			);
		}
	);
};
