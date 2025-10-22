import { getDataGivenStepsOfFields, setValueAtPath, stepsOfFieldsToQueryFragmentObject } from '$lib/utils/usefulFunctions';
import { get } from 'svelte/store';
import type {
	PaginationTypeInfo,
	FieldWithDerivedData,
	PaginationState,
	PaginationStateStore,
	EndpointInfoStore,
	SchemaData,
	QMSType
} from '$lib/types';

export const get_paginationTypes = (
	endpointInfo: EndpointInfoStore,
	schemaData: SchemaData
): PaginationTypeInfo[] => {
	return [
		{
			name: 'notAvailable',
			get_rowLimitingArgNames: (paginationArgs: FieldWithDerivedData[]) => {
				return [];
			},
			get_initialState: (paginationArgs: FieldWithDerivedData[]): PaginationState => {
				console.log('notAvailable');
				return {};
			},
			get_defaultPaginationStateForDynamic: (state: PaginationState): PaginationState => {
				return state;
			},
			get_dependencyColsData: (QMS_name: string) => {
				return [];
			},
			get_nextPageState: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				console.log('notAvailable');
				return state;
			},
			get_prevPageState: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				console.log('notAvailable');
				return state;
			},
			isFirstPage: (_paginationState_Store: PaginationStateStore, paginationArgs: FieldWithDerivedData[]) => {
				return true;
			},
			check: (standsForArray: string[]) => {
				return standsForArray.length == 0;
			}
		},
		{
			name: 'offsetBased',
			get_rowLimitingArgNames: (paginationArgs: FieldWithDerivedData[]) => {
				const limitName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'limit';
				})?.dd_displayName;
				return [limitName];
			},
			get_initialState: (paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				const limitName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'limit';
				})?.dd_displayName;
				const state: PaginationState = {};
				if (limitName) state[limitName] = 20;
				if (offsetName) state[offsetName] = 0;
				return state;
			},
			get_dependencyColsData: (QMS_name: string) => {
				return [];
			},
			get_defaultPaginationStateForDynamic: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				if (offsetName) _state[offsetName] = 0;
				return _state;
			},
			get_nextPageState: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				const limitName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'limit';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				if (offsetName && limitName && typeof _state[offsetName] === 'number' && typeof _state[limitName] === 'number') {
					_state[offsetName] += _state[limitName];
				}
				return _state;
			},
			get_prevPageState: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				const limitName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'limit';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				if (offsetName && limitName && typeof _state[offsetName] === 'number' && typeof _state[limitName] === 'number') {
					_state[offsetName] -= _state[limitName];
				}
				return _state;
			},
			isFirstPage: (_paginationState_Store: PaginationStateStore, paginationArgs: FieldWithDerivedData[]) => {
				const offsetName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'offset';
				})?.dd_displayName;
				if (!offsetName) return true;
				const offsetValue = get(_paginationState_Store)?.[offsetName];
				return !(typeof offsetValue === 'number' && offsetValue > 0);
			},
			check: (standsForArray: string[]) => {
				return standsForArray.includes('limit') && standsForArray.includes('offset');
			}
		},
		{
			name: 'edgeBased',
			get_rowLimitingArgNames: (paginationArgs: FieldWithDerivedData[]) => {
				const firstName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'first';
				})?.dd_displayName;
				const lastName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'last';
				})?.dd_displayName;
				return [firstName, lastName];
			},
			get_initialState: (paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const firstName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'first';
				})?.dd_displayName;
				const state: PaginationState = {};
				if (firstName) state[firstName] = 20;
				return state;
			},
			get_defaultPaginationStateForDynamic: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const afterName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'after';
				})?.dd_displayName;
				const beforeName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'before';
				})?.dd_displayName;
				let _state = JSON.parse(JSON.stringify(state));
				if (afterName) delete _state[afterName];
				if (beforeName) delete _state[beforeName];
				return _state;
			},
			get_dependencyColsData: (QMS_name, QMS_type, schemaData) => {
				//using 'pageInfo' for getting next page cursor,'nextPage' is not a standard,some use another name like 'endCursor' { title: 'nextPageCursor', stepsOfFields: [QMS_name, 'pageInfo', 'nextPage'] }
				const dependencyColsData = [];
				const endpointInfoVal = get(endpointInfo);
				const pageInfoFieldsLocation = endpointInfoVal.pageInfoFieldsLocation;
				let currentQMS_info = schemaData.get_QMS_Field(QMS_name, QMS_type, schemaData);
				const rowsLocation = endpointInfo.get_rowsLocation(currentQMS_info, schemaData);

				const relayPageInfoFieldsNames = endpointInfo.get_relayPageInfoFieldsNames(currentQMS_info, pageInfoFieldsLocation, schemaData)
				const relayCursorFieldName = endpointInfo.get_relayCursorFieldName(currentQMS_info, rowsLocation, schemaData)

				const namings = {
					...relayPageInfoFieldsNames, ...relayCursorFieldName
				}
				console.log({
					relayPageInfoFieldsNames,
					relayCursorFieldName, namings
				})
				if (namings?.endCursor || namings?.startCursor) {
					if (namings?.hasNextPage) {
						dependencyColsData.push({
							title: namings.hasNextPage,
							hidden: true,
							stepsOfFields: [QMS_name, ...pageInfoFieldsLocation, namings.hasNextPage],
							stepsOfFieldsOBJ: setValueAtPath({}, [QMS_name, ...pageInfoFieldsLocation, namings.hasNextPage], 'novaluehere', true)
						});
					}
					if (namings?.hasPreviousPage) {
						dependencyColsData.push({
							title: namings.hasPreviousPage,
							hidden: true,
							stepsOfFields: [QMS_name, ...pageInfoFieldsLocation, namings.hasPreviousPage],
							stepsOfFieldsOBJ: setValueAtPath({}, [QMS_name, ...pageInfoFieldsLocation, namings.hasPreviousPage], 'novaluehere', true)
						});
					}
					if (namings?.startCursor) {
						dependencyColsData.push({
							title: namings.startCursor,
							hidden: true,
							stepsOfFields: [QMS_name, ...pageInfoFieldsLocation, namings.startCursor],
							stepsOfFieldsOBJ: setValueAtPath({}, [QMS_name, ...pageInfoFieldsLocation, namings.startCursor], 'novaluehere', true)
						});
					}
					if (namings?.endCursor) {
						dependencyColsData.push({
							title: namings.endCursor,
							hidden: true,
							stepsOfFields: [QMS_name, ...pageInfoFieldsLocation, namings.endCursor],
							stepsOfFieldsOBJ: setValueAtPath({}, [QMS_name, ...pageInfoFieldsLocation, namings.endCursor], 'novaluehere', true)
						});
					}
					//return dependencyColsData;
				}

				if (namings?.cursor) {
					dependencyColsData.push({
						title: namings.cursor,
						stepsOfFields: [QMS_name, ...rowsLocation, namings.cursor],
						stepsOfFieldsOBJ: setValueAtPath({}, [QMS_name, ...rowsLocation, namings.cursor], 'novaluehere', true)
						//stepsOfFieldsOBJ: stepsOfFieldsToQueryFragmentObject([QMS_name, ...rowsLocation, namings.cursor], false)
					});
				}
				return dependencyColsData;
			},
			get_nextPageState: (state, paginationArgs, returnedDataBatch_last, QMS_name, QMS_type) => {
				const endpointInfoVal = get(endpointInfo);
				let currentQMS_info = schemaData.get_QMS_Field(QMS_name, QMS_type, schemaData);
				const pageInfoFieldsLocation = endpointInfoVal.pageInfoFieldsLocation;
				const rowsLocation = endpointInfoVal.rowsLocationPossibilities.find((rowsLocation) => {
					return rowsLocation.check(currentQMS_info);
				}).rowsLocation;

				const relayPageInfoFieldsNames = endpointInfo.get_relayPageInfoFieldsNames(currentQMS_info, pageInfoFieldsLocation, schemaData)
				const relayCursorFieldName = endpointInfo.get_relayCursorFieldName(currentQMS_info, rowsLocation, schemaData)

				const namings = {
					...relayPageInfoFieldsNames, ...relayCursorFieldName
				}


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
			isFirstPage: (_paginationState_Store: PaginationStateStore, paginationArgs: FieldWithDerivedData[]) => {
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
			check: (standsForArray: string[]) => {
				return (
					standsForArray.includes('first') ||
					(standsForArray.includes('last') && standsForArray.includes('after')) ||
					standsForArray.includes('before')
				);
			}
		},
		{
			name: 'pageBased',
			get_rowLimitingArgNames: (paginationArgs: FieldWithDerivedData[]) => {
				const page = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				return [page];
			},
			get_initialState: (paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				return {
					[pageName]: 1
				};
			},
			get_dependencyColsData: (QMS_name: string) => {
				return [];
			},
			get_defaultPaginationStateForDynamic: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				let _state = JSON.parse(JSON.stringify(state));
				_state = { ..._state, [pageName]: 1 };
				return _state;
			},
			get_nextPageState: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				_state[pageName]++;
				return _state;
			},
			get_prevPageState: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				const pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				const _state = JSON.parse(JSON.stringify(state));
				_state[pageName]--;
				return _state;
			},
			isFirstPage: (_paginationState_Store: PaginationStateStore, paginationArgs: FieldWithDerivedData[]) => {
				let pageName = paginationArgs.find((arg) => {
					return arg.dd_standsFor == 'page';
				})?.dd_displayName;
				return get(_paginationState_Store)?.[pageName] == 1;
			},
			check: (standsForArray: string[]) => {
				return standsForArray.includes('page');
			}
		},
		{
			name: 'unknown',
			get_rowLimitingArgNames: (paginationArgs: FieldWithDerivedData[]) => {
				return [];
			},
			get_initialState: (paginationArgs: FieldWithDerivedData[]): PaginationState => {
				console.log('unknown');
			},
			get_defaultPaginationStateForDynamic: (state) => {
				return state;
			},
			get_dependencyColsData: (QMS_name: string) => {
				return [];
			},
			get_nextPageState: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				console.log('unknown');
			},
			get_prevPageState: (state: PaginationState, paginationArgs: FieldWithDerivedData[]): PaginationState => {
				console.log('unknown');
			},
			isFirstPage: (_paginationState_Store: PaginationStateStore, paginationArgs: FieldWithDerivedData[]) => {
				return true;
			},
			check: (standsForArray: string[]) => {
				return standsForArray.length == 0;
			}
		}
	]
}