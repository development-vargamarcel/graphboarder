import { writable } from "svelte/store";

export const Create_mergedChildren_QMSWraperCtxData_Store = (initialValue = {}) => {
  const store = writable(initialValue);
  const { subscribe, set, update } = store;
  return store
}
