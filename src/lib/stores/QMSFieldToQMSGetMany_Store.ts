import { get, writable, type Writable } from 'svelte/store';

interface QMSFieldItem {
	nodeOrField: {
		dd_displayName: string;
		dd_rootName: string;
	};
	id?: number;
}

type GetIdentifierValueFn = (obj: QMSFieldItem) => string;

const getIdentifierValue: GetIdentifierValueFn = (obj) => {
	const nodeOrField = obj.nodeOrField;
	return `${nodeOrField.dd_displayName}${nodeOrField.dd_rootName}`;
};

const getObjIndexInArray = (
	arr: QMSFieldItem[] = [],
	obj: QMSFieldItem = {} as QMSFieldItem,
	getIdentifierValue: GetIdentifierValueFn
): number => {
	const objIdentifierValue = getIdentifierValue(obj);
	return arr.findIndex((currObj) => {
		return objIdentifierValue == getIdentifierValue(currObj);
	});
};

export interface QMSFieldToQMSGetManyStore extends Writable<QMSFieldItem[]> {
	addOrReplaceKeepingOldId: (obj: QMSFieldItem) => void;
	delete: (obj: QMSFieldItem) => void;
	getObj: (obj: QMSFieldItem) => QMSFieldItem | undefined;
}

export const Create_QMSFieldToQMSGetMany_Store = (
	initialValue: QMSFieldItem[] = []
): QMSFieldToQMSGetManyStore => {
	const store = writable<QMSFieldItem[]>(initialValue);
	const { subscribe, set, update } = store;
	return {
		subscribe,
		set,
		update,
		addOrReplaceKeepingOldId: (obj: QMSFieldItem): void => {
			const storeVal = get(store);
			const objIndexInArray = getObjIndexInArray(storeVal, obj, getIdentifierValue);
			const objIsPresentInArray = objIndexInArray > -1;
			if (objIsPresentInArray) {
				storeVal[objIndexInArray] = { ...obj, id: storeVal[objIndexInArray]?.id };
			} else {
				storeVal.push(obj);
			}
			store.set(storeVal);
		},
		delete: (obj: QMSFieldItem): void => {
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
		getObj: (obj: QMSFieldItem): QMSFieldItem | undefined => {
			const storeVal = get(store);
			const objIndexInArray = getObjIndexInArray(storeVal, obj, getIdentifierValue);
			const objIsPresentInArray = objIndexInArray > -1;
			return storeVal[objIndexInArray];
		}
	};
};
