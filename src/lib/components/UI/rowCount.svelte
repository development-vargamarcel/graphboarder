<script lang="ts">
	import { getDataGivenStepsOfFields } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import type { QMSMainWraperContext } from '$lib/types/index';

	interface Props {
		prefix?: string;
		QMS_bodyPart_StoreDerived: any;
		QMS_info: any;
	}

	import { untrack } from 'svelte';

	let { prefix = '', QMS_bodyPart_StoreDerived, QMS_info }: Props = $props();

	let mainWraperCtx = getContext<QMSMainWraperContext>(
		`${untrack(() => prefix)}QMSMainWraperContext`
	);
	const endpointInfo = mainWraperCtx?.endpointInfo;

	const urqlCoreClient = mainWraperCtx?.urqlCoreClient;
	const schemaData = mainWraperCtx?.schemaData;

	let countValue = $state();
	let queryData = $state<any>();
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
	$effect(() => {
		const unsubscribe = QMS_bodyPart_StoreDerived.subscribe((QMS_body) => {
			if (QMS_body && QMS_body !== '') {
				runQuery(
					`query {
				${QMS_body}
		}`
				);
			}
		});
		return unsubscribe;
	});
</script>

<div>
	{countValue}
</div>
