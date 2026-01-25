<script lang="ts">
	import { getContext } from 'svelte';
	import SelectModal from './SelectModal.svelte';
	import Fuse from 'fuse.js';
	import Modal from './Modal.svelte';
	import SelectQMS from './SelectQMS.svelte';
	import { getDeepField } from '$lib/utils/usefulFunctions';
	import { Logger } from '$lib/utils/logger';

	interface Props {
		nodes: any;
		parentNodeId: any;
		parentNode?: any;
		node: any;
		availableOperators: any;
		group: any;
		type: any;
		originalNodes: any;
		prefix?: string;
		addDefaultFields: any;
		showSelectQMSModal?: boolean;
		selectedRowsColValues?: any;
		field: any;
	}

	let {
		nodes,
		parentNodeId,
		parentNode = nodes[parentNodeId],
		node,
		availableOperators,
		group,
		type,
		originalNodes,
		prefix = '',
		addDefaultFields,
		showSelectQMSModal = $bindable(false),
		selectedRowsColValues = [],
		field
	}: Props = $props();
	const nodeContext_forDynamicData = getContext(`${prefix}nodeContext_forDynamicData`);
	let selectedQMS = nodeContext_forDynamicData.selectedQMS;
	let QMSRows = nodeContext_forDynamicData.QMSRows;
	let rowSelectionState = nodeContext_forDynamicData.rowSelectionState;
	//
	let context = getContext<any>(`${prefix}QMSMainWraperContext`);
	const endpointInfo = context?.endpointInfo;
	const schemaData = context?.schemaData;
	//
	const OutermostQMSWraperContext = getContext<any>(`${prefix}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	let inputFieldsContainerLocation = $derived(endpointInfo.get_inputFieldsContainerLocation(
		field,
		schemaData
	));
	let inputFieldsContainer = $derived(getDeepField(
		field,
		inputFieldsContainerLocation,
		schemaData,
		'inputFields'
	));
	$effect(() => {
		Logger.debug({ inputFieldsContainerLocation, inputFieldsContainer });
	});
	// $: if ($selectedQMS) {
	// 	// Logger.debug(
	// 	// 	{ field, node, nodes },
	// 	// 	nodes[node.id],
	// 	// 	schemaData.get_rootType(null, field.dd_rootName, schemaData)
	// 	// );
	// 	const objToAdd = {
	// 		nodeOrField: field,
	// 		getMany: { selectedQMS: $selectedQMS, rowSelectionState: $rowSelectionState },
	// 		id: Math.random().toString(36).substr(2, 9)
	// 	};
	// 	Logger.debug({ objToAdd });
	// 	QMSFieldToQMSGetMany_Store.addOrReplaceKeepingOldId(objToAdd);
	// }

	const handleClick = () => {
		getPossibleQMS();
		showSelectQMSModal = true;
	};
	const fuse = new Fuse($schemaData.queryFields, {
		includeScore: false,
		includeMatches: false,
		threshold: 0.8,
		//ignoreLocation: true,
		//		keys: ['dd_displayName', 'dd_rootName', 'description']
		keys: ['dd_StrForFuseComparison']
	});

	const getPossibleQMS = () => {
		// const getReturningFields = (type, matchingField, depth = 0, maxDepth = 2) => {
		// 	if (depth > maxDepth) {
		// 		return null;
		// 	}
		// 	depth++;
		// 	let rootType = schemaData.get_rootType(null, type.dd_rootName, schemaData);
		// 	let fields = rootType?.fields;
		// 	if (!fields) {
		// 		return null;
		// 	}
		// 	const myField = fields.find((field) => field.dd_displayName == matchingField.dd_displayName);
		// 	if (myField) {
		// 		return fields;
		// 	}
		// 	let returningFields;
		// 	fields.find((field) => {
		// 		returningFields = getReturningFields(field, matchingField, depth, maxDepth);
		// 		return returningFields; //if returningFields is undefined, the loop continues
		// 	});
		// 	if (returningFields) {
		// 		return returningFields;
		// 	}
		// };
		// const originType = group.originType;
		// const originTypeRoot = schemaData.get_rootType(null, originType.dd_rootName, schemaData);
		// const fields = getReturningFields(originType, node);
		// console.log('aaaaaa', {
		// 	originType,
		// 	originTypeRoot,
		// 	group,
		// 	fields
		// });

		const myField = field;
		if (myField) {
			const myFieldRoot = schemaData.get_rootType(null, myField.dd_rootName, schemaData);
			const myFieldSubfields = myFieldRoot.fields;
			Logger.debug('aaaaaa', {
				myField,
				myFieldRoot,
				myFieldSubfields
			});
			$QMSRows = $schemaData.queryFields.filter((item) => {
				return item.dd_kindList && item.dd_rootName == myField.dd_rootName;
			});
			Logger.debug({ QMSRows });
			if ($QMSRows.length == 1) {
				$selectedQMS = $QMSRows[0];

				return;
			}
			if ($QMSRows.length > 0) {
				return;
			}
			$QMSRows = fuse
				.search(`${myField.dd_StrForFuseComparison}`)
				.map((item) => item.item)
				.filter((item) => item.dd_kindList);
			if ($QMSRows.length > 0) {
				return;
			}
			$QMSRows = fuse
				.search(`${myField.dd_rootName}`)
				.map((item) => item.item)
				.filter((item) => item.dd_kindList);
			if ($QMSRows.length > 0) {
				return;
			}
		}
		//	Logger.debug({ node, QMSRows });
		$QMSRows = fuse
			.search(
				`${node?.dd_rootName?.replaceAll('_', ' ')} | ${node?.dd_displayName?.replaceAll(
					//!!!node?.dd_displayName?.replaceAll "?" might cause unexpected problems
					'_',
					' '
				)}`
			)
			.map((item) => item.item)
			.filter((item) => item.dd_kindList);
		if ($QMSRows.length > 0) {
			return;
		}
		$QMSRows = fuse
			.search(
				`${node.dd_rootName.replaceAll('_', ' ')} | ${node.dd_displayName.replaceAll('_', ' ')}`
			)
			.map((item) => item.item);
	};
</script>

<button class="btn btn-xs btn-ghost" onclick={handleClick}
	>{field.dd_displayName}
	{#if field.dd_NON_NULL}
		<sup>
			<i class="text-primary bi bi-asterisk"></i>
		</sup>
	{/if}
</button>
<SelectQMS bind:showSelectQMSModal />
