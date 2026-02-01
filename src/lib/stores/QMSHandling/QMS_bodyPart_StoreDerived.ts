import {
	build_QMS_bodyPart,
	gqlArgObjToString,
	tableColsDataToQueryFields
} from '$lib/utils/usefulFunctions';
import { derived, get } from 'svelte/store';
import _ from 'lodash';
import type { FinalGQLArgObj, QMSType, StepsOfFieldsObject, TableColumnData } from '$lib/types';

export const Create_QMS_bodyPart_StoreDerived = (
	finalGqlArgObj_Store: any,
	tableColsData_Store: any,
	QMS_type: QMSType = 'query',
	QMS_name: string,
	paginationOptions_Store: any,
	paginationState_derived_Store: any,
	mergedChildren_finalGqlArgObj_Store: any,
	initialGqlArgObj: Record<string, unknown> = {}
) => {
	return derived(
		[
			finalGqlArgObj_Store,
			tableColsData_Store,
			paginationState_derived_Store,
			mergedChildren_finalGqlArgObj_Store
		],
		(
			[$finalGqlArgObj_Store, $tableColsData_Store, , $mergedChildren_finalGqlArgObj_Store],
			set
		) => {
			let paginationState = {};
			if (paginationState_derived_Store?.get_value) {
				paginationState = paginationState_derived_Store?.get_value();
			}
			const get_QMS_args = () => {
				console.log({ initialGqlArgObj });
				// const merged = _.merge({}, initialGqlArgObj || {},
				// 	$finalGqlArgObj_Store?.finalGqlArgObj || {},
				// 	paginationState,
				// );
				const finalGqlArgObj = ($finalGqlArgObj_Store as FinalGQLArgObj)?.finalGqlArgObj || {};
				const merged = _.merge({}, initialGqlArgObj || {}, paginationState, finalGqlArgObj);
				return merged;
			};

			console.log('$mergedChildren_finalGqlArgObj_Store', $mergedChildren_finalGqlArgObj_Store);

			const fields = tableColsDataToQueryFields($tableColsData_Store as TableColumnData[]);
			const fieldsObj = typeof fields === 'string' ? {} : fields;

			set(
				build_QMS_bodyPart(
					QMS_name,
					fieldsObj as Record<string, unknown>,
					get_QMS_args(),
					QMS_type,
					$mergedChildren_finalGqlArgObj_Store as Record<string, unknown>
				)
			);
		}
	);
};
