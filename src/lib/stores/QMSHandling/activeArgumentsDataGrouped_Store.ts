import { argumentCanRunQuery, generate_gqlArgObj, getPreciseType, getRootType } from '$lib/utils/usefulFunctions';
import { json } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';
import _ from 'lodash';
export const Create_activeArgumentsDataGrouped_Store = (
	initialValue = [],
	rootGroupArgsVisible = true
) => {
	const store = writable(initialValue);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		set_groups: (QMS_info, schemaData, QMSarguments, endpointInfo) => {
			const argsInfo = QMS_info?.args;
			console.log({ argsInfo });
			//handle generating activeArgumentsDataGrouped
			const activeArgumentsDataGrouped = [];
			const hasRootArgs = argsInfo?.find((el) => {
				return el.dd_isRootArg;
			});

			if (hasRootArgs) {
				const rootGroup = {
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
					const newGroupData = {
						originType: QMS_info,

						group_name: el.dd_displayName,
						group_isRoot: false,
						// group_info: el,
						...el,
						group_args: []
					};

					const hasFilterOperators =
						getRootType(null, el.dd_rootName, schemaData)?.dd_baseFilterOperators?.length > 0;
					newGroupData.group_argsNode = {
						mainContainer: {
							...el,
							operator: 'bonded',
							isMain: true,
							not: false,
							items: [],
							id: 'mainContainer'
						}
					};

					if (hasFilterOperators) {
						newGroupData.group_argsNode = {
							mainContainer: {
								...el,
								operator: '_and',
								isMain: true,
								not: false,
								items: [],
								id: 'mainContainer'
							}
						};
					}

					const expectsList = el.dd_kindList;
					if (expectsList) {
						newGroupData.group_argsNode = {
							mainContainer: {
								...el,
								operator: 'list',
								isMain: true,
								not: false,
								items: [],
								id: 'mainContainer'
							}
						};
					}

					activeArgumentsDataGrouped.push(newGroupData);
				}
			});
			//filter out duplicate groups:
			const seenGroupNames = [];
			activeArgumentsDataGrouped.forEach((group, index) => {
				if (seenGroupNames.includes(group.group_name)) {
					activeArgumentsDataGrouped.splice(index, 1);
				}
				seenGroupNames.push(group.group_name);
			});
			//
			//Handle QMSarguments data if present
			console.log({ QMSarguments });
			if (QMSarguments) {
				gqlArgObjToActiveArgumentsDataGrouped(QMSarguments, activeArgumentsDataGrouped, schemaData, endpointInfo);
			}

			addAllRootArgs(activeArgumentsDataGrouped, schemaData, endpointInfo);
			set(activeArgumentsDataGrouped);
		},
		update_groups: (groupNewData) => {
			console.log({ groupNewData });
			update((activeArgumentsDataGrouped) => {
				let index = activeArgumentsDataGrouped.findIndex((group) => {
					return group.group_name == groupNewData.group_name;
				});
				activeArgumentsDataGrouped[index] = groupNewData;
				return activeArgumentsDataGrouped;
			});
		},
		update_activeArgument: (activeArgumentData, groupName) => {
			update((activeArgumentsDataGrouped) => {
				const gqlArgObj = generate_gqlArgObj([activeArgumentData]);
				const canRunQuery = argumentCanRunQuery(activeArgumentData);
				Object.assign(activeArgumentData, { ...gqlArgObj, canRunQuery });
				const group = activeArgumentsDataGrouped?.find((group) => {
					return group.group_name == groupName;
				});
				console.log('ppppp group', group);
				const activeArgument = group.group_args?.find((arg) => {
					return arg.id == activeArgumentData.id;
				});
				const activeArgumentNode = group?.group_argsNode?.[activeArgumentData.id];
				if (!activeArgument && !activeArgumentNode) {
					console.log('nothing updated');
				}
				if (activeArgumentNode) {
					console.log('updated activeArgumentNode', activeArgumentNode);
					Object.assign(activeArgumentNode, activeArgumentData);
				}
				if (activeArgument) {
					console.log('updated activeArgument', activeArgument);

					Object.assign(activeArgument, activeArgumentData);
				}

				return activeArgumentsDataGrouped;
			});
		},
		delete_activeArgument: (activeArgumentData, groupName) => {
			update((activeArgumentsDataGrouped) => {
				let group = activeArgumentsDataGrouped?.filter((group) => {
					return group.group_name == groupName;
				})[0];
				const activeArgumentIndex = group.group_args?.findIndex((arg) => {
					return arg.id == activeArgumentData.id;
				});
				if (group.group_argsNode) {
					let containers = Object.values(group.group_argsNode).filter((container) => {
						return container?.items;
					});
					let argumentParentContainerId = containers.find((container) => {
						return container.items.find((item) => {
							return item.id == activeArgumentData.id;
						});
					}).id;
					if (argumentParentContainerId) {
						group.group_argsNode[argumentParentContainerId].items = group.group_argsNode[
							argumentParentContainerId
						].items.filter((item) => {
							return item.id != activeArgumentData.id;
						});
					}

					if (activeArgumentIndex) {
						group.group_args.splice(activeArgumentIndex, 1);
					}
				} else {
					group.group_args.splice(activeArgumentIndex, 1);
				}
				return activeArgumentsDataGrouped;
			});
		},
		get_activeArgument: (stepsOfFields, group_name = 'root') => {
			const storeValue = get(store);
			return storeValue
				.find((group) => {
					return group.group_name == group_name;
				})
				?.group_args?.find((arg) => {
					return arg.stepsOfFieldsStringified == JSON.stringify(stepsOfFields);
				});
		},
		add_activeArgument: (newArgumentOrContainerData, groupName, parentContainerId, endpointInfo) => {
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
	newArgumentOrContainerData,
	groupName,
	parentContainerId,
	activeArgumentsDataGrouped, endpointInfo, group
) => {
	const dataIsForContainer = newArgumentOrContainerData?.items;
	console.log({ dataIsForContainer, newArgumentOrContainerData })
	if (!group) {
		group = activeArgumentsDataGrouped?.find((currGroup) => {
			console.log('currGroup', currGroup, currGroup.group_name, groupName, currGroup.group_name == groupName, currGroup.group_name === groupName);
			return currGroup.group_name == groupName;
		})
	}
	if (!group) {
		console.warn('group not found', { groupName, newArgumentOrContainerData })
		return
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
			newArgumentOrContainerData.dd_relatedRoot =
				'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON';
			newArgumentOrContainerData.not = false;
			group.group_argsNode[newArgumentOrContainerData.id] = newArgumentOrContainerData;

			if (parentContainerId) {
				group.group_argsNode[parentContainerId].items.push(newArgumentOrContainerData);
			} else {
				group.group_argsNode.mainContainer.items.push(newArgumentOrContainerData);
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
				console.log('already added');
			}
		}
	}
	return activeArgumentsDataGrouped;
};

export const generateContainerData = (stepsOfFields, type, extraData = {}) => {
	const dd_displayName = type.dd_displayName;

	if (stepsOfFields[stepsOfFields.length - 1] !== dd_displayName) {
		stepsOfFields.push(dd_displayName); //take care might caus eproblems
	}
	return {
		///inputFields,
		///enumValues,
		items: [],
		stepsOfFields,
		stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
		id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
		...type,
		...extraData
	};
};

export const generateArgData = (stepsOfFields, type, schemaData, extraData = {}) => {
	const dd_displayName = type.dd_displayName;

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
		id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
		...type,
		...extraData
	};
};

const addAllRootArgs = (activeArgumentsDataGrouped, schemaData, endpointInfo) => {
	const group = activeArgumentsDataGrouped.find((group) => {
		return group.group_name == 'root';
	});
	if (!group) {
		console.log('no root group');
		return
	}
	const groupName = group.group_name;
	const groupOriginType = group.originType;
	const groupArgs = groupOriginType.args.filter((arg) => {
		return arg.dd_isRootArg;
	});
	groupArgs.forEach((argType, i) => {
		const argData = generateArgData([argType.dd_displayName], argType, schemaData);
		console.log({ argData });
		add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(
			argData,
			groupName,
			null,
			activeArgumentsDataGrouped, endpointInfo
		);
	});
};
const gqlArgObjToActiveArgumentsDataGrouped = (object, activeArgumentsDataGrouped, schemaData, endpointInfo) => {
	const getGroupGqlArgObj = (object, rootGroupGqlArgObj, group) => {
		if (!group.group_isRoot) {
			return object?.[group.group_name];
		}
		return rootGroupGqlArgObj;
	};
	//object is QMSarguments object
	const nonRootGroupNames = activeArgumentsDataGrouped.map((group) => {
		if (!group.group_isRoot) {
			return group.group_name;
		}
	});

	const rootGroupGqlArgObj = {};
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
				const argType = groupOriginType.args.filter((type) => {
					return type.dd_displayName == argName;
				})[0];
				const argData = generateArgData([argName], argType, schemaData, {
					chd_dispatchValue: groupGqlArgObj[argName],
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

			//
		}
		console.log({ groupName, group_isRoot, groupGqlArgObj, groupOriginType });
	});
	return activeArgumentsDataGrouped;
};

const gqlArgObjToActiveArgumentsDataGroupedForHasArgsNode = (gqlArgObj, type, groupName, group, activeArgumentsDataGrouped, schemaData, endpointInfo) => {
	let group_argsNode
	const gqlArgObjTypeOf = getPreciseType(gqlArgObj);
	const isContainer = type.dd_shouldExpand
		; (function () {//handle containers only
			if (!isContainer) {
				return
			}
			if (gqlArgObjTypeOf == 'array') {

				gqlArgObj.forEach(element => {
				});

			}

		})()
}