import { argumentCanRunQuery, generate_gqlArgObj, getRootType } from '$lib/utils/usefulFunctions';
import { json } from '@sveltejs/kit';
import { get, writable } from 'svelte/store';

export const Create_activeArgumentsDataGrouped_Store = () => {
	const store = writable([]);
	const { subscribe, set, update } = store;

	return {
		subscribe,
		set,
		update,
		set_groups: (QMS_info, schemaData) => {
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
					let argumentContainerId = containers.find((container) => {
						return container.items.find((item) => {
							return item.id == activeArgumentData.id;
						});
					}).id;
					if (argumentContainerId) {
						group.group_argsNode[argumentContainerId].items = group.group_argsNode[
							argumentContainerId
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
		add_activeArgument: (newArgData, groupName, containerId) => {
			update((activeArgumentsDataGrouped) => {
				return add_activeArgumentTo_activeArgumentsDataGrouped(newArgData, groupName, containerId, activeArgumentsDataGrouped);
			});
		}
	};
};
export const add_activeArgumentTo_activeArgumentsDataGrouped = (newArgData, groupName, containerId, activeArgumentsDataGrouped) => {
	let group = activeArgumentsDataGrouped?.filter((group) => {
		return group.group_name == groupName;
	})[0];
	const activeArgumentIndex = group.group_args?.findIndex((arg) => {
		return arg.id == newArgData.id;
	});

	{
		if (group.group_argsNode) {
			//to prevent --> Uncaught TypeError: Converting circular structure to JSON
			newArgData.dd_relatedRoot =
				'overwritten to evade error: Uncaught TypeError: Converting circular structure to JSON';
			newArgData.not = false;
			group.group_argsNode[newArgData.id] = newArgData;

			if (containerId) {
				group.group_argsNode[containerId].items.push({ id: newArgData.id });
			} else {
				group.group_argsNode.mainContainer.items.push({ id: newArgData.id });
			}
			group.group_args.push(newArgData);
		} else {
			if (
				!group.group_args.some((el) => {
					return el.stepsOfFieldsStringified == newArgData.stepsOfFieldsStringified;
				})
			) {
				group.group_args.push(newArgData);

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
		inputFields,
		enumValues,
		stepsOfFields,
		stepsOfFieldsStringified: JSON.stringify(stepsOfFields),
		id: `${JSON.stringify(stepsOfFields)}${Math.random()}`,
		...type,
		...extraData
	};
};