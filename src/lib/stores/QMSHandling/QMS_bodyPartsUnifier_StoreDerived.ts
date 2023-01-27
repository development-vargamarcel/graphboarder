import { derived } from 'svelte/store';

export const Create_QMS_bodyPartsUnifier_StoreDerived = (
	_QMS_bodyPart_StoreDerived_array: Array,
	QMS_type = 'query',
	QMS_name = 'QMS_name'
) => {
	return derived(_QMS_bodyPart_StoreDerived_array, ($stores) => {
		const storesReduced = $stores.reduce((prevVal, currVal) => {
			if (!currVal) {
				return '';
			}
			return prevVal + currVal;
		}, '');

		if (!storesReduced) {
			return '';
		}
		const QMS_body = `${QMS_type}-${QMS_name}{
            ${storesReduced}
        }`;
		return QMS_body.replaceAll(/\s/g, '').replace('-', ' ');
	});
};
