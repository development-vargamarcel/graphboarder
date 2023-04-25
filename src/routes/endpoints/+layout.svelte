<script lang="ts">
	import MainWraper from '$lib/components/MainWraper.svelte';
	import type { LayoutData } from './$types';
	//!!Q
	export const prefix = '';
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
	import { getRootType } from '$lib/utils/usefulFunctions';
	import { getContext } from 'svelte';
	import { stigifyAll } from '$lib/stores/testData/testEndpoints';

	export let data: LayoutData;
	const endpointInfoProvided = {
		url: 'https://vgqkcskomrpikolllkix.nhost.run/v1/graphql',
		isMantained: true,
		description: 'offsetBased pagination,rowCount set',
		headers: { 'x-hasura-admin-secret': '3f3e46f190464c7a8dfe19e6c94ced84' },
		rowsLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			},
			{
				get_Val: (QMS_info, schemaData) => {
					return [];
				},
				check: (QMS_info, schemaData) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			}
		],
		rowCountLocationPossibilities: [
			{
				get_Val: (QMS_info, schemaData) => {
					return [QMS_info.dd_displayName, 'aggregate', 'count'];
				},
				check: (QMS_info, schemaData) => {
					return QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			},
			{
				get_Val: (QMS_info, schemaData) => {
					if (
						schemaData.get_QMS_Field(`${QMS_info.dd_displayName}Aggregate`, 'query', schemaData)
					) {
						return [`${QMS_info.dd_displayName}Aggregate`, 'aggregate', 'count'];
					}
					return [`${QMS_info.dd_displayName}_aggregate`, 'aggregate', 'count'];
				},
				check: (QMS_info, schemaData) => {
					return !QMS_info.dd_displayName.toLowerCase().endsWith('aggregate');
				}
			}
		]
	};
	//console.log('endpointInfoProvided json', stigifyAll(endpointInfoProvided));
</script>

<MainWraper {endpointInfoProvided}>
	<slot><!-- optional fallback --></slot>
</MainWraper>
