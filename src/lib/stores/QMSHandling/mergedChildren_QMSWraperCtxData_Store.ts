import { get, writable } from 'svelte/store';
const getObjIndexInArray = (arr = [], obj = {}, identifierKey = 'stepsOfFields') => {
	const objIdentifierKeyValue_string = JSON.stringify(obj[identifierKey]);
	return arr.findIndex((currObj) => {
		return JSON.stringify(currObj[identifierKey]) == objIdentifierKeyValue_string;
	});
};
export const Create_mergedChildren_QMSWraperCtxData_Store = (initialValue = []) => {
	const store = writable(initialValue);
	const { subscribe, set, update } = store;
	return {
		...store,
		addOrReplace: (obj) => {
			const storeVal = get(store);
			const objIndexInArray = getObjIndexInArray(storeVal, obj, 'stepsOfFields');
			const objIsPresentInArray = objIndexInArray > -1;
			if (objIsPresentInArray) {
				storeVal[objIndexInArray] = obj;
			} else {
				storeVal.push(obj);
			}
			store.set(storeVal);
		},
		getObj: (stepsOfFields) => {
			const storeVal = get(store);
			const objIndexInArray = getObjIndexInArray(storeVal, { stepsOfFields }, 'stepsOfFields');
			const objIsPresentInArray = objIndexInArray > -1;
			return storeVal[objIndexInArray];
		}
	};
};
