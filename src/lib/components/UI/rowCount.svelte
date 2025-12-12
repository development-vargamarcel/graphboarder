<script lang="ts">
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;

	const urqlCoreClient = QMSMainWraperContext?.urqlCoreClient;
	const schemaData = QMSMainWraperContext?.schemaData;
	import { getDataGivenStepsOfFields } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';

	interface Props {
		prefix?: string;
		QMS_bodyPart_StoreDerived: any;
		QMS_info: any;
	}

	let { prefix = '', QMS_bodyPart_StoreDerived, QMS_info }: Props = $props();

	let countValue = $state();
	let queryData = $state();
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
	$effect(() => {
		if (queryData?.data) {
			countValue = getDataGivenStepsOfFields(
				null,
				queryData.data,
				endpointInfo.get_rowCountLocation(QMS_info, schemaData)
			);
		} else {
			countValue = '?';
		}
	});
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
