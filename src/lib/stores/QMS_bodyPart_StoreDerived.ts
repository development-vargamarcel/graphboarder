import {
	build_QMS_bodyPart,
	gqlArgObjToString,
	tableColsDataToQueryFields
} from '$lib/utils/usefulFunctions';
import { derived, get } from 'svelte/store';
import _ from 'lodash';

export const Create_QMS_bodyPart_StoreDerived = (
	_final_grqlArgObj_Store,
	_tableColsData_Store,
	QMS_type = 'query',
	QMS_name: string,
	paginationOptions_Store,
	_paginationState_derived_Store,
) => {
	return derived(
		[_final_grqlArgObj_Store, _tableColsData_Store, _paginationState_derived_Store],
		([$_final_grqlArgObj_Store, $_tableColsData_Store], set) => {
			let paginationState = _paginationState_derived_Store?.get_value()
			const get_QMS_args = () => {
				if (_paginationState_derived_Store) {
					const merged = _.merge({},
						$_final_grqlArgObj_Store?.final_gqlArgObj,
						paginationState
					);
					return gqlArgObjToString(merged);

				}
				if ($_final_grqlArgObj_Store?.final_gqlArgObj) {
					return gqlArgObjToString($_final_grqlArgObj_Store?.final_gqlArgObj)
				}
				return ''
			}


			set(
				build_QMS_bodyPart(
					QMS_name,
					tableColsDataToQueryFields($_tableColsData_Store),
					get_QMS_args(),
					QMS_type
				)
			);
		}
	);
};
