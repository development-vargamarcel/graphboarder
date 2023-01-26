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
	_pagination_state_derived_Store,
	pagination_state_Store
) => {
	return derived(
		[_final_grqlArgObj_Store, _tableColsData_Store, _pagination_state_derived_Store],
		([$_final_grqlArgObj_Store, $_tableColsData_Store, $_pagination_state_derived_Store], set) => {
			console.log('test1', get(pagination_state_Store), $_pagination_state_derived_Store)
			const get_QMS_args = () => {
				if (pagination_state_Store) {
					const merged = _.merge(
						$_final_grqlArgObj_Store?.final_gqlArgObj,
						get(pagination_state_Store)
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
