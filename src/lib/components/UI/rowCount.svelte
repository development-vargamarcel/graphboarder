<script>
	export let prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;

	const schemaData = QMSMainWraperContext?.schemaData;
	import { urqlCoreClient } from '$lib/utils/urqlCoreClient';
	import { getDataGivenStepsOfFields } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';

	export let QMS_bodyPart_StoreDerived;
	export let QMS_info;

	let countValue;
	let queryData;
	const runQuery = (queryBody) => {
		let fetching = true;
		let error = false;
		let data = false;
		$urqlCoreClient
			.query(queryBody)
			.toPromise()
			.then((result) => {
				fetching = false;

				if (result.error) {
					error = result.error.message;
				}
				if (result.data) {
					data = result.data;
				}
				queryData = { fetching, error, data };
			});
	};
	$: {
		if (queryData?.data) {
			countValue = getDataGivenStepsOfFields(
				null,
				queryData.data,
				endpointInfo.get_rowCountLocation(QMS_info, schemaData)
			);
		} else {
			countValue = '?';
		}
	}
	QMS_bodyPart_StoreDerived.subscribe((QMS_body) => {
		if (QMS_body && QMS_body !== '') {
			runQuery(
				`query {
				${QMS_body}
		}`
			);
		}
	});
</script>

<div>
	{countValue}
</div>
