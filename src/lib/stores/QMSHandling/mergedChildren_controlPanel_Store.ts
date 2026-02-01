import { get, writable } from 'svelte/store';
const getIdentifierValue = (obj) => {
	return JSON.stringify(obj.stepsOfFieldsThisAppliesTo) + obj.nodeId;
};
const getObjIndexInArray = (arr = [], obj = {}, getIdentifierValue) => {
	const objIdentifierValue = getIdentifierValue(obj);
	return arr.findIndex((currObj) => {
		return objIdentifierValue == getIdentifierValue(currObj);
	});
};
export const Create_mergedChildren_controlPanel_Store = (initialValue = []) => {
	const store = writable(initialValue);
	const { subscribe, set, update } = store;
	return {
		...store,
		addOrReplaceKeepingOldId: (obj) => {
			const storeVal = get(store);
			const objIndexInArray = getObjIndexInArray(storeVal, obj, getIdentifierValue);
			const objIsPresentInArray = objIndexInArray > -1;
			if (objIsPresentInArray) {
				storeVal[objIndexInArray] = { obj, id: storeVal[objIndexInArray]?.id };
			} else {
				storeVal.push(obj);
			}
			store.set(storeVal);
		},
		delete: (obj) => {
			const storeVal = get(store);
			const objIndexInArray = getObjIndexInArray(storeVal, obj, getIdentifierValue);
			const objIsPresentInArray = objIndexInArray > -1;
			if (objIsPresentInArray) {
				storeVal.splice(objIndexInArray, 1);
			} else {
				console.warn('nothing to delete');
			}
			store.set(storeVal);
		},
		getObj: (obj) => {
			const storeVal = get(store);
			const objIndexInArray = getObjIndexInArray(storeVal, obj, getIdentifierValue);
			const objIsPresentInArray = objIndexInArray > -1;
			return storeVal[objIndexInArray];
		}
	};
};
