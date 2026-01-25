import { argumentCanRunQuery, generate_gqlArgObj, getPreciseType, getRootType } from '$lib/utils/usefulFunctions';
import { get, writable } from 'svelte/store';
import { Logger } from '$lib/utils/logger';
import _ from 'lodash';
import type {
	ActiveArgumentsDataGroupedStore,
	ActiveArgumentGroup,
	ActiveArgumentData,
	ContainerData,
	FieldWithDerivedData,
	SchemaDataStore,
	EndpointInfoStore
} from '$lib/types';

export const Create_activeArgumentsDataGrouped_Store = (
	initialValue: ActiveArgumentGroup[] = [],
	rootGroupArgsVisible: boolean = true
): ActiveArgumentsDataGroupedStore => {
	const store = writable<ActiveArgumentGroup[]>(initialValue);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		set_groups: (
			QMS_info: FieldWithDerivedData,
			schemaData: SchemaDataStore,
			QMSarguments: Record<string, unknown> | null,
			endpointInfo: EndpointInfoStore
		) => {
			const QMS_infoRoot = getRootType(null, QMS_info.dd_rootName, schemaData)
			const argsInfo = QMS_info?.args;
			Logger.debug({ argsInfo });
			//handle generating activeArgumentsDataGrouped
			const activeArgumentsDataGrouped: ActiveArgumentGroup[] = [];
			const hasRootArgs = argsInfo?.find((el) => {
				return el.dd_isRootArg;
			});



			////-------- all encompassing group !!!put this first to have it overriden by other groups,or last for opposite result
			const addAllArgsGroup = () => {
				Logger.debug('ppppp', QMS_info, QMS_infoRoot)
				const newGroupData: ActiveArgumentGroup = {
					originType: QMS_info,

					group_name: 'all',
					group_hasAllArgs: true,
					group_isRoot: false,
					// group_info: el,
					...QMS_info,
					group_args: [],
					group_argsNode: {
						mainContainer: {
							...QMS_info,
							operator: 'bonded',
							isMain: true,
							not: false,
							items: [],
							id: 'mainContainer',
							stepsOfFields: [],
							stepsOfFieldsStringified: '[]'
						} as ContainerData
					}
				};
				activeArgumentsDataGrouped.push(newGroupData);
			}
			////-----------
			//////////////////////////----------Smart groups
			const addSmartGroups = () => {
				if (hasRootArgs) {
					const rootGroup: ActiveArgumentGroup = {
						originType: QMS_info,
						group_name: 'root',
						group_isRoot: true,
						dd_kindList: false,
						group_args: []
					};
					activeArgumentsDataGrouped.push(rootGroup);
				}

				argsInfo?.forEach((el) => {
					if (!el.dd_isRootArg) {
						const newGroupData: ActiveArgumentGroup = {
							originType: QMS_info,

							group_name: el.dd_displayName,
							group_isRoot: false,
							// group_info: el,
							...el,
							group_args: [],
							group_argsNode: {
								mainContainer: {
									...el,
									operator: 'bonded',
									isMain: true,
									not: false,
									items: [],
									id: 'mainContainer',
									stepsOfFields: [],
									stepsOfFieldsStringified: '[]'
								} as ContainerData
							}
						};

						const hasFilterOperators =
							getRootType(null, el.dd_rootName, schemaData)?.dd_baseFilterOperators?.length ?? 0 > 0;

						// if (hasFilterOperators) {
						// 	newGroupData.group_argsNode = {
						// 		mainContainer: {
						// 			...el,
						// 			operator: '_and',
						// 			isMain: true,
						// 			not: false,
						// 			items: [],
						// 			id: 'mainContainer'
						// 		}
						// 	};
						// }

						const expectsList = el.dd_kindList;
						if (expectsList && newGroupData.group_argsNode) {
							newGroupData.group_argsNode.mainContainer.operator = 'list';
						}

						activeArgumentsDataGrouped.push(newGroupData);
					}
				});
			}
			//////////////////////////----------
			//addSmartGroups()
			addAllArgsGroup()//!!!put this first to have it's result overriden by other groups, or last for opposite result



			//filter out duplicate groups:
			const seenGroupNames: string[] = [];
			const uniqueGroups: ActiveArgumentGroup[] = [];
			activeArgumentsDataGrouped.forEach((group) => {
				if (!seenGroupNames.includes(group.group_name)) {
					uniqueGroups.push(group);
					seenGroupNames.push(group.group_name);
				}
			});
			// Replace with filtered list
			activeArgumentsDataGrouped.length = 0;
			activeArgumentsDataGrouped.push(...uniqueGroups);

			//
			//Handle QMSarguments data if present
			Logger.debug({ QMSarguments });
			if (QMSarguments) {
				gqlArgObjToActiveArgumentsDataGrouped(QMSarguments, activeArgumentsDataGrouped, schemaData, endpointInfo);
			}

			addAllRootArgs(activeArgumentsDataGrouped, schemaData, endpointInfo);
			set(activeArgumentsDataGrouped);
		},
		update_groups: (groupNewData: ActiveArgumentGroup) => {
			Logger.debug({ groupNewData });
			update((activeArgumentsDataGrouped) => {
				let index = activeArgumentsDataGrouped.findIndex((group) => {
					return group.group_name == groupNewData.group_name;
				});
				activeArgumentsDataGrouped[index] = groupNewData;
				return activeArgumentsDataGrouped;
			});
		},
		update_activeArgument: (activeArgumentData: ActiveArgumentData, groupName: string) => {
			update((activeArgumentsDataGrouped) => {
				const gqlArgObj = generate_gqlArgObj([activeArgumentData]);
				const canRunQuery = argumentCanRunQuery(activeArgumentData);
				Object.assign(activeArgumentData, { ...gqlArgObj, canRunQuery });
				const group = activeArgumentsDataGrouped?.find((group) => {
					return group.group_name == groupName;
				});
				Logger.debug('ppppp group', group);
				const activeArgument = group?.group_args?.find((arg) => {
					return arg.id == activeArgumentData.id;
				});
				const activeArgumentNode = group?.group_argsNode?.[activeArgumentData.id];
				if (!activeArgument && !activeArgumentNode) {
					Logger.debug('nothing updated');
				}
				if (activeArgumentNode) {
					Logger.debug('updated activeArgumentNode', activeArgumentNode);
					Object.assign(activeArgumentNode, activeArgumentData);
				}
				if (activeArgument) {
					Logger.debug('updated activeArgument', activeArgument);

					Object.assign(activeArgument, activeArgumentData);
				}

				return activeArgumentsDataGrouped;
			});
		},
		delete_activeArgument: (activeArgumentData: ActiveArgumentData, groupName: string) => {
			update((activeArgumentsDataGrouped) => {
				let group = activeArgumentsDataGrouped?.find((group) => {
					return group.group_name == groupName;
				});
				if (!group) return activeArgumentsDataGrouped;

				const activeArgumentIndex = group.group_args?.findIndex((arg) => {
					return arg.id == activeArgumentData.id;
				});
				if (group.group_argsNode) {
					let containers = Object.values(group.group_argsNode).filter((container) => {
						return container?.items;
					});
					let argumentParentContainer = containers.find((container) => {
						return container.items.find((item) => {
							return item.id == activeArgumentData.id;
						});
					});

					if (argumentParentContainer) {
						argumentParentContainer.items = argumentParentContainer.items.filter((item) => {
							return item.id != activeArgumentData.id;
						});
					}

					if (activeArgumentIndex !== undefined && activeArgumentIndex !== -1) {
						group.group_args.splice(activeArgumentIndex, 1);
					}
				} else {
					if (activeArgumentIndex !== undefined && activeArgumentIndex !== -1) {
						group.group_args.splice(activeArgumentIndex, 1);
					}
				}
				return activeArgumentsDataGrouped;
			});
		},
		get_activeArgument: (stepsOfFields: string[], group_name: string = 'root') => {
			const storeValue = get(store);
			return storeValue
				.find((group) => {
					return group.group_name == group_name;
				})
				?.group_args?.find((arg) => {
					return arg.stepsOfFieldsStringified == JSON.stringify(stepsOfFields);
				});
		},
		add_activeArgument: (
			newArgumentOrContainerData: ActiveArgumentData | ContainerData,
			groupName: string,
			parentContainerId: string | null,
			endpointInfo: EndpointInfoStore
		) => {
			update((activeArgumentsDataGrouped) => {
				return add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(
					newArgumentOrContainerData,
					groupName,
					parentContainerId,
					activeArgumentsDataGrouped, endpointInfo
				);
			});
		}
	};
};
export const add_activeArgumentOrContainerTo_activeArgumentsDataGrouped = (
	newArgumentOrContainerData: ActiveArgumentData | ContainerData,
	groupName: string,
	parentContainerId: string | null,
	activeArgumentsDataGrouped: ActiveArgumentGroup[],
	endpointInfo: EndpointInfoStore,
	group?: ActiveArgumentGroup
): ActiveArgumentGroup[] => {
	const dataIsForContainer = (newArgumentOrContainerData as ContainerData)?.items;
	Logger.debug({ dataIsForContainer, newArgumentOrContainerData })
	if (!group) {
		group = activeArgumentsDataGrouped?.find((currGroup) => {
			Logger.debug('currGroup', currGroup, currGroup.group_name, groupName, currGroup.group_name == groupName, currGroup.group_name === groupName);
			return currGroup.group_name == groupName;
		})
	}
	if (!group) {
		Logger.warn('group not found', { groupName, newArgumentOrContainerData })
		return activeArgumentsDataGrouped
	}
	; (function () {
		if (dataIsForContainer) {
			return
		}
		if (!endpointInfo) { return }
		let typeExtraData = endpointInfo.get_typeExtraData(newArgumentOrContainerData);
		if (!typeExtraData) { return }
		const gqlArgObj = generate_gqlArgObj([newArgumentOrContainerData])
		newArgumentOrContainerData = _.merge({}, newArgumentOrContainerData, gqlArgObj)
		if (typeExtraData.defaultValue == undefined) { return }

		if (newArgumentOrContainerData.chd_rawValue == undefined) {
			newArgumentOrContainerData.chd_rawValue = typeExtraData.defaultValue
		}
		if (newArgumentOrContainerData.chd_dispatchValue == undefined) {
			newArgumentOrContainerData.chd_dispatchValue = typeExtraData.use_transformer(typeExtraData.defaultValue);
		}
	})()


	{
		if (group.group_argsNode) {
			//to prevent --> Uncaught TypeError: Converting circular structure to JSON
			(newArgumentOrContainerData as any).dd_relatedRoot =
				'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON';
			newArgumentOrContainerData.not = false;
			group.group_argsNode[newArgumentOrContainerData.id] = newArgumentOrContainerData as ContainerData;

			if (parentContainerId) {
				group.group_argsNode[parentContainerId].items.push(newArgumentOrContainerData as any);
			} else {
				group.group_argsNode.mainContainer.items.push(newArgumentOrContainerData as any);
			}
			group.group_args.push(newArgumentOrContainerData);
		} else {
			if (
				!group.group_args.some((el) => {
					return el.stepsOfFieldsStringified == newArgumentOrContainerData.stepsOfFieldsStringified;
				})
			) {
				group.group_args.push(newArgumentOrContainerData);
			} else {
				Logger.debug('already added');
			}
		}
	}
	return activeArgumentsDataGrouped;
};

export const generateContainerData = (
	stepsOfFields: string[],
	type: Partial<FieldWithDerivedData>,
	extraData: Record<string, unknown> = {}
): ContainerData => {
	const dd_displayName = type.dd_displayName!;

	if (stepsOfFields[stepsOfFields.length - 1] !== dd_displayName) {
		stepsOfFields.push(dd_displayName); //take care might caus eproblems
	}

	const lastDefiningData: any = {}
	if (type && type.dd_kindList) {
		lastDefiningData.operator = 'list'
	}

	return {
		///inputFields,
		///enumValues,
		items: [],
		stepsOfFields,
		stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
		id: `qqqqqq${Math.random()}`,
		operator: lastDefiningData.operator,
		...type,
		...extraData,
		...lastDefiningData
	} as ContainerData;
};

export const generateArgData = (
	stepsOfFields: string[],
	type: Partial<FieldWithDerivedData>,
	schemaData: SchemaDataStore,
	extraData: Record<string, unknown> = {}
): ActiveArgumentData => {
	const dd_displayName = type.dd_displayName!;

	const RootType = getRootType(null, type.dd_rootName, schemaData);
	const inputFields = RootType?.inputFields;
	const enumValues = RootType?.enumValues;
	if (stepsOfFields[stepsOfFields.length - 1] !== dd_displayName) {
		stepsOfFields.push(dd_displayName); //take care might caus eproblems
	}
	return {
		not: false,
		inputFields,
		enumValues,
		stepsOfFields,
		stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
		id: `qqqqqq${Math.random()}`,
		...type,
		...extraData
	};
};

const addAllRootArgs = (
	activeArgumentsDataGrouped: ActiveArgumentGroup[],
	schemaData: SchemaDataStore,
	endpointInfo: EndpointInfoStore
): void => {
	const group = activeArgumentsDataGrouped.find((group) => {
		return group.group_name == 'root';
	});
	if (!group) {
		Logger.debug('no root group');
		return
	}
	const groupName = group.group_name;
	const groupOriginType = group.originType;
	if (!groupOriginType.args) return;
	const groupArgs = groupOriginType.args.filter((arg) => {
		return arg.dd_isRootArg;
	});
	groupArgs.forEach((argType, i) => {
		const argData = generateArgData([argType.dd_displayName], argType, schemaData);
		Logger.debug({ argData });
		add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(
			argData,
			groupName,
			null,
			activeArgumentsDataGrouped, endpointInfo
		);
	});
};
const gqlArgObjToActiveArgumentsDataGrouped = (
	object: Record<string, unknown>,
	activeArgumentsDataGrouped: ActiveArgumentGroup[],
	schemaData: SchemaDataStore,
	endpointInfo: EndpointInfoStore
): ActiveArgumentGroup[] => {
	const getGroupGqlArgObj = (
		object: Record<string, unknown>,
		rootGroupGqlArgObj: Record<string, unknown>,
		group: ActiveArgumentGroup
	): Record<string, unknown> | undefined => {
		if (!group.group_isRoot) {
			return object?.[group.group_name] as Record<string, unknown> | undefined;
		}
		return rootGroupGqlArgObj;
	};
	//object is QMSarguments object
	const nonRootGroupNames = activeArgumentsDataGrouped.map((group) => {
		if (!group.group_isRoot) {
			return group.group_name;
		}
	});

	const rootGroupGqlArgObj: Record<string, unknown> = {};
	Object.keys(object).forEach((key) => {
		if (!nonRootGroupNames.includes(key)) {
			rootGroupGqlArgObj[key] = object[key];
		}
	});
	//iterate through groups
	activeArgumentsDataGrouped.forEach((group) => {
		const groupName = group.group_name;
		const group_isRoot = group.group_isRoot;
		const groupGqlArgObj = getGroupGqlArgObj(object, rootGroupGqlArgObj, group);
		const groupOriginType = group.originType;

		if (!groupGqlArgObj) {
			return;
		}

		//Do the magic here:
		if (group_isRoot) {
			const groupArgNames = Object.keys(groupGqlArgObj);
			//!!!this block should work correctly,you will see some errors only because root group is not handled correctly in generating gqlArgObj after ui changes,test it and see,it only handles one argument even if u set multiple.
			groupArgNames.forEach((argName, i) => {
				const argType = groupOriginType.args?.filter((type) => {
					return type.dd_displayName == argName;
				})[0];
				if (!argType) return;
				const argValue = groupGqlArgObj[argName];
				const argData = generateArgData([argName], argType, schemaData, {
					chd_rawValue: argValue,
					chd_dispatchValue: argValue,
					inUse: true
				});

				add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(
					argData,
					groupName,
					null,
					activeArgumentsDataGrouped, endpointInfo, undefined
				);
			});
		} else {
			// Handle non-root groups
			if (!group.group_argsNode) {
				// For groups without argsNode structure, we skip for now
				Logger.debug('Skipping non-root group without argsNode:', groupName);
				return;
			}

			// For groups with argsNode (like "all" group), process all arguments
			const groupArgNames = Object.keys(groupGqlArgObj);
			groupArgNames.forEach((argName) => {
				// Find the argument type from the origin type
				const argType = groupOriginType.args?.find((type) => {
					return type.dd_displayName === argName;
				});

				if (!argType) {
					Logger.warn(`Argument type not found for: ${argName}`);
					return;
				}

				const argValue = groupGqlArgObj[argName];

				// Create argument data with the value from the query
				const argData = generateArgData([argName], argType, schemaData, {
					chd_rawValue: argValue,
					chd_dispatchValue: argValue,
					inUse: true
				});

				// Add the argument to the group
				add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(
					argData,
					groupName,
					null,
					activeArgumentsDataGrouped,
					endpointInfo,
					group
				);
			});
		}
		Logger.debug({ groupName, group_isRoot, groupGqlArgObj, groupOriginType });
	});
	return activeArgumentsDataGrouped;
};

const gqlArgObjToActiveArgumentsDataGroupedForHasArgsNode = (
	gqlArgObj: Record<string, unknown>,
	type: Partial<FieldWithDerivedData>,
	groupName: string,
	group: ActiveArgumentGroup,
	activeArgumentsDataGrouped: ActiveArgumentGroup[],
	schemaData: SchemaDataStore,
	endpointInfo: EndpointInfoStore
): void => {
	let group_argsNode
	const gqlArgObjTypeOf = getPreciseType(gqlArgObj);
	const isContainer = type.dd_shouldExpand
		; (function () {//handle containers only
			if (!isContainer) {
				return
			}
			if (gqlArgObjTypeOf == 'array') {
				(gqlArgObj as any[]).forEach(element => {
				});
			}

		})()
}
