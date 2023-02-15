import { getDataGivenStepsOfFields } from '$lib/utils/usefulFunctions';
import { get } from 'svelte/store';
import { endpointInfo } from '$lib/stores/endpointHandling/endpointInfo';
import { schemaData } from '$lib/stores/endpointHandling/schemaData';



export const get_paginationTypes = (endpointInfo) => {
	return [
		{
			name: 'notAvailable',
			get_rowLimitingArgNames: (paginationArgs) => {
				return [];
			},
			get_initialState: (paginationArgs) => {
				console.log('notAvailable');
			},
			get_defaultPaginationStateForDynamic: (state) => {
				return state;
			},
			get_dependencyColsData: (QMS_name) => {
				return [];
			},
			get_nextPageState: (state, paginationArgs) => {
				console.log('notAvailable');
			},
			get_prevPageState: (state, paginationArgs) => {
				console.log('notAvailable');
			},
			isFirstPage: (_paginationState_Store, paginationArgs) => {
				return true;
			},
			check: (standsForArray) => {
				return standsForArray.length == 0;
			}
		},
		{
			name: 'offsetBased',
			get_rowLimitingArgNames: (paginationArgs) => {
				const limitName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'limit';
				})?.dd_displayName;
				return [limitName];
			},
			get_initialState: (paginationArgs) => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				const limitName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'limit';
				})?.dd_displayName;
				return {
					[limitName]: 20,
					[offsetName]: 0
				};
			},
			get_dependencyColsData: (QMS_name) => {
				return [];
			},
			get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				_state[offsetName] = 0;
				return _state;
			},
			get_nextPageState: (state, paginationArgs) => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				const limitName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'limit';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				_state[offsetName] += _state[limitName];
				return _state;
			},
			get_prevPageState: (state, paginationArgs) => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				const limitName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'limit';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				_state[offsetName] -= _state[limitName];
				return _state;
			},
			isFirstPage: (_paginationState_Store, paginationArgs) => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				return !get(_paginationState_Store)?.[offsetName] > 0;
			},
			check: (standsForArray) => {
				return standsForArray.includes('limit') && standsForArray.includes('offset');
			}
		},
		{
			name: 'edgeBased',
			get_rowLimitingArgNames: (paginationArgs) => {
				const firstName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'first';
				})?.dd_displayName;
				const lastName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'last';
				})?.dd_displayName;
				return [firstName, lastName];
			},
			get_initialState: (paginationArgs) => {
				const firstName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'first';
				})?.dd_displayName;
				return {
					[firstName]: 20
				};
			},
			get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
				const afterName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'after';
				})?.dd_displayName;
				const beforeName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'before';
				})?.dd_displayName;
				let _state = JSON.parse(JSON.stringify(state));
				delete _state[afterName];
				delete _state[beforeName];
				return _state;
			},
			get_dependencyColsData: (QMS_name, QMS_type) => {
				//using 'pageInfo' for getting next page cursor,'nextPage' is not a standard,some use another name like 'endCursor' { title: 'nextPageCursor', stepsOfFields: [QMS_name, 'pageInfo', 'nextPage'] }
				const dependencyColsData = [];
				const endpointInfoVal = get(endpointInfo);
				const namings = endpointInfoVal?.namings;
				const pageInfoFieldsLocation = endpointInfoVal.pageInfoFieldsLocation;
				let currentQMS_info = schemaData.get_QMS_Field(QMS_name, QMS_type);
				const rowsLocation = endpointInfo.get_rowsLocation(currentQMS_info);

				if (namings?.endCursor || namings?.startCursor) {
					if (namings?.hasNextPage) {
						dependencyColsData.push({
							title: namings.hasNextPage,
							hidden: true,
							stepsOfFields: [QMS_name, ...pageInfoFieldsLocation, namings.hasNextPage]
						});
					}
					if (namings?.hasPreviousPage) {
						dependencyColsData.push({
							title: namings.hasPreviousPage,
							hidden: true,
							stepsOfFields: [QMS_name, ...pageInfoFieldsLocation, namings.hasPreviousPage]
						});
					}
					if (namings?.startCursor) {
						dependencyColsData.push({
							title: namings.startCursor,
							hidden: true,
							stepsOfFields: [QMS_name, ...pageInfoFieldsLocation, namings.startCursor]
						});
					}
					if (namings?.endCursor) {
						dependencyColsData.push({
							title: namings.endCursor,
							hidden: true,
							stepsOfFields: [QMS_name, ...pageInfoFieldsLocation, namings.endCursor]
						});
					}
					return dependencyColsData;
				}

				if (namings?.cursor) {
					dependencyColsData.push({
						title: namings.cursor,
						stepsOfFields: [QMS_name, ...rowsLocation, namings.cursor]
					});
				}
				return dependencyColsData;
			},
			get_nextPageState: (state, paginationArgs, returnedDataBatch_last, QMS_name, QMS_type) => {
				const endpointInfoVal = get(endpointInfo);
				const namings = endpointInfoVal?.namings;
				let currentQMS_info = schemaData.get_QMS_Field(QMS_name, QMS_type);
				const pageInfoFieldsLocation = endpointInfoVal.pageInfoFieldsLocation;
				const rowsLocation = endpointInfoVal.rowsLocationPossibilities.find((rowsLocation) => {
					return rowsLocation.check(currentQMS_info);
				}).rowsLocation;

				const afterName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'after';
				})?.dd_displayName;
				const stepsOfFieldsToCursor = ['edges', 'cursor'];
				const stepsOfFieldsToEndCursor = [QMS_name, ...pageInfoFieldsLocation, namings.endCursor];
				const _state = JSON.parse(JSON.stringify(state));
				if (namings?.endCursor && returnedDataBatch_last) {
					let endCursorValue = getDataGivenStepsOfFields(
						undefined,
						returnedDataBatch_last,
						stepsOfFieldsToEndCursor
					);
					if (endCursorValue) {
						_state[afterName] = `'${endCursorValue}'`;
					}
					console.log({ _state }, { returnedDataBatch_last });
				} else if (namings?.cursor) {
					let rows = getDataGivenStepsOfFields(undefined, returnedDataBatch_last, [
						currentQMS_info.dd_displayName,
						...rowsLocation
					]);
					let lastRow = rows[rows.length - 1];
					console.log({ lastRow });
					_state[afterName] = `'${getDataGivenStepsOfFields(
						undefined,
						lastRow,
						stepsOfFieldsToCursor
					)}'`;
					console.log({ _state });
				}
				return _state;
			},
			get_prevPageState: (state, paginationArgs, returnedDataBatch_last, QMS_name) => {
				const _state = JSON.parse(JSON.stringify(state));
				return _state;
			},
			isFirstPage: (_paginationState_Store, paginationArgs) => {
				const afterName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'after';
				})?.dd_displayName;
				const beforeName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'before';
				})?.dd_displayName;
				return (
					!get(_paginationState_Store)?.[afterName] && !get(_paginationState_Store)?.[beforeName]
				);
			},
			check: (standsForArray) => {
				return (
					standsForArray.includes('first') ||
					(standsForArray.includes('last') && standsForArray.includes('after')) ||
					standsForArray.includes('before')
				);
			}
		},
		{
			name: 'pageBased',
			get_rowLimitingArgNames: (paginationArgs) => {
				const page = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				return [page];
			},
			get_initialState: (paginationArgs) => {
				const pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				return {
					[pageName]: 1
				};
			},
			get_dependencyColsData: (QMS_name) => {
				return [];
			},
			get_defaultPaginationStateForDynamic: (state, paginationArgs) => {
				const pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				let _state = JSON.parse(JSON.stringify(state));
				_state = { ..._state, [pageName]: 1 };
				return _state;
			},
			get_nextPageState: (state, paginationArgs) => {
				const pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				_state[pageName]++;
				return _state;
			},
			get_prevPageState: (state, paginationArgs) => {
				const pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				_state[pageName]--;
				return _state;
			},
			isFirstPage: (_paginationState_Store, paginationArgs) => {
				let pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				return get(_paginationState_Store)?.[pageName] == 1;
			},
			check: (standsForArray) => {
				return standsForArray.includes('page');
			}
		},
		{
			name: 'unknown',
			get_rowLimitingArgNames: (paginationArgs) => {
				return [];
			},
			get_initialState: (paginationArgs) => {
				console.log('unknown');
			},
			get_defaultPaginationStateForDynamic: (state) => {
				return state;
			},
			get_dependencyColsData: (QMS_name) => {
				return [];
			},
			get_nextPageState: (state, paginationArgs) => {
				console.log('unknown');
			},
			get_prevPageState: (state, paginationArgs) => {
				console.log('unknown');
			},
			isFirstPage: (_paginationState_Store, paginationArgs) => {
				return true;
			},
			check: (standsForArray) => {
				return standsForArray.length == 0;
			}
		}
	]
}