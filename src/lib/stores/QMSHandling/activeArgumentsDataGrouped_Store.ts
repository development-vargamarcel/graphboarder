import { argumentCanRunQuery, generate_gqlArgObj, getRootType } from '$lib/utils/usefulFunctions';
import { json } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';

export const Create_activeArgumentsDataGrouped_Store = (initialValue = []) => {
	const store = writable(initialValue);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		set_groups: (QMS_info, schemaData, QMSarguments) => {
			const argsInfo = QMS_info?.args
			console.log({ argsInfo })
			//handle generating activeArgumentsDataGrouped
			const activeArgumentsDataGrouped = []
			const hasRootArgs = argsInfo?.find((el) => {
				return el.dd_isRootArg
			})


			if (hasRootArgs) {
				const rootGroup = {
					originType: QMS_info,
					group_name: 'root',
					group_isRoot: true,
					dd_kindList: false,
					group_args: []
				};
				activeArgumentsDataGrouped.push(rootGroup)
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

					const hasFilterOperators = getRootType(null, el.dd_rootName, schemaData)?.dd_baseFilterOperators?.length > 0;
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

					const expectsList = el.dd_kindList
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
			const seenGroupNames = []
			activeArgumentsDataGrouped.forEach((group, index) => {
				if (seenGroupNames.includes(group.group_name)) {
					activeArgumentsDataGrouped.splice(index, 1)
				}
				seenGroupNames.push(group.group_name)
			})
			//
			//Handle QMSarguments data if present
			console.log({ QMSarguments })
			if (QMSarguments) {
				gqlArgObjToActiveArgumentsDataGrouped(QMSarguments, activeArgumentsDataGrouped);
			}
			set(activeArgumentsDataGrouped);
		},
		update_groups: (groupNewData) => {
			console.log({ groupNewData })
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
		add_activeArgument: (newArgumentOrContainerData, groupName, parentContainerId) => {
			update((activeArgumentsDataGrouped) => {
				return add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(newArgumentOrContainerData, groupName, parentContainerId, activeArgumentsDataGrouped);
			});
		}
	};
};
export const add_activeArgumentOrContainerTo_activeArgumentsDataGrouped = (newArgumentOrContainerData, groupName, parentContainerId, activeArgumentsDataGrouped) => {
	let group = activeArgumentsDataGrouped?.filter((group) => {
		return group.group_name == groupName;
	})[0];
	const activeArgumentIndex = group.group_args?.findIndex((arg) => {
		return arg.id == newArgumentOrContainerData.id;
	});

	{
		if (group.group_argsNode) {
			//to prevent --> Uncaught TypeError: Converting circular structure to JSON
			newArgumentOrContainerData.dd_relatedRoot =
				'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON';
			newArgumentOrContainerData.not = false;
			group.group_argsNode[newArgumentOrContainerData.id] = newArgumentOrContainerData;

			if (parentContainerId) {
				group.group_argsNode[parentContainerId].items.push({ id: newArgumentOrContainerData.id });
			} else {
				group.group_argsNode.mainContainer.items.push({ id: newArgumentOrContainerData.id });
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

}

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


const gqlArgObjToActiveArgumentsDataGrouped = (object, activeArgumentsDataGrouped) => {
	const getGroupGqlArgObj = (object, rootGroupGqlArgObj, group) => {
		if (!group.group_isRoot) {
			return object?.[group.group_name]
		}
		return rootGroupGqlArgObj
	}
	//object is QMSarguments object
	const nonRootGroupNames = activeArgumentsDataGrouped.map((group) => {
		if (!group.group_isRoot) {
			return group.group_name;
		}
	})


	const rootGroupGqlArgObj = {};
	Object.keys(object).forEach((key) => {
		if (!nonRootGroupNames.includes(key)) {
			rootGroupGqlArgObj[key] = object[key];
		}
	})
	//iterate through groups
	activeArgumentsDataGrouped.forEach((group) => {
		const groupGqlArgObj = getGroupGqlArgObj(object, rootGroupGqlArgObj, group)
		console.log({ groupGqlArgObj })
		if (groupGqlArgObj) {
			//iterate through arguments
			groupGqlArgObj.forEach((arg) => {
				// //get argument data
				// const argData = generateArgData(
				// 	[group.group_name, arg.name],
				// 	arg,
				// 	arg.schema
				// );
				// //add argument data to activeArgumentsDataGrouped
				// activeArgumentsDataGrouped = add_activeArgumentOrContainerTo_activeArgumentsDataGrouped(
				// 	argData,
				// 	group.group_name,
				// 	null,
				// 	activeArgumentsDataGrouped
				// );
			});
		}

	})
	return activeArgumentsDataGrouped

}