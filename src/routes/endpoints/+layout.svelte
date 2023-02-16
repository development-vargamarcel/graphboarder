<script lang="ts">
	import MainWraper from '$lib/components/MainWraper.svelte';
	import type { LayoutData } from './$types';
	//!!Q
	export const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';

	export let data: LayoutData;
	const endpointInfoProvided = {
		url: 'https://hdfgzkxs.directus.app/graphql',
		isMantained: true,
		description: 'offsetBased pagination,rowCount set',
		headers: {
			authorization: 'Bearer mKZiTQr8DCKMlT3teTi1Xf-3Ml9EKGXh'
		},
		displayNamePossibilitiesForCreateItem: [
			{
				get_Val: (QMS_info) => {
					return `create_${QMS_info.dd_rootName}_item`;
				},
				check: (QMS_info) => {
					return true;
				}
			}
		],
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info) => {
					return [];
				}, //'countDistinct'
				check: (QMS_info) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			},
			{
				get_Val: (QMS_info) => {
					return [];
				},
				check: (QMS_info) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregated');
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					console.log('ee');
					const aggregatedQMS_info = schemaData.get_QMS_Field(
						`${QMS_info.dd_displayName}_aggregated`,
						'query'
					);
					const rootType = getRootType(null, QMS_info.dd_rootName, schemaData);
					console.log('ee', rootType);
					if (!rootType) {
						return null;
					}
					const nodeFieldsQMS_info = rootType.fields[0].dd_displayName;
					if (nodeFieldsQMS_info) {
						return [`${QMS_info.dd_displayName}_aggregated`, 'count', nodeFieldsQMS_info];
					}
					return null;
				},
				check: (QMS_info) => {
					return (
						!QMS_info.dd_displayName.toLowerCase().endsWith('aggregated') &&
						!QMS_info.dd_displayName.toLowerCase().endsWith('by_id')
					);
				}
			}
		]
	};
</script>

<MainWraper {endpointInfoProvided}>
	<slot><!-- optional fallback --></slot>
</MainWraper>
