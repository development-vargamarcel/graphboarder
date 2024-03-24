<script>
	import { getContext } from 'svelte';
	import SelectModal from './SelectModal.svelte';
	import Fuse from 'fuse.js';
	import Modal from './Modal.svelte';
	import SelectQMS from './SelectQMS.svelte';
	import { getDeepField } from '$lib/utils/usefulFunctions';

	export let nodes;
	export let parentNodeId;
	export let parentNode = nodes[parentNodeId];
	export let node;
	export let availableOperators;
	export let group;
	export let type;
	export let originalNodes;
	export let prefix = '';
	export let addDefaultFields;
	export let showSelectQMSModal = false;
	export let selectedRowsColValues = [];
	export let field;
	const nodeContext_forDynamicData = getContext(`${prefix}nodeContext_forDynamicData`);
	let selectedQMS = nodeContext_forDynamicData.selectedQMS;
	let QMSRows = nodeContext_forDynamicData.QMSRows;
	let rowSelectionState = nodeContext_forDynamicData.rowSelectionState;
	//
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	//
	const OutermostQMSWraperContext = getContext(`${prefix}OutermostQMSWraperContext`);
	const { QMSFieldToQMSGetMany_Store } = OutermostQMSWraperContext;
	const inputFieldsContainerLocation = endpointInfo.get_inputFieldsContainerLocation(
		field,
		schemaData
	);
	const inputFieldsContainer = getDeepField(
		field,
		inputFieldsContainerLocation,
		schemaData,
		'inputFields'
	);
	console.log({ inputFieldsContainerLocation, inputFieldsContainer });
	$: if ($selectedQMS) {
		console.log(
			{ field, node, nodes },
			nodes[node.id],
			schemaData.get_rootType(null, field.dd_rootName, schemaData)
		);
		const objToAdd = {
			nodeOrField: field,
			getMany: { selectedQMS: $selectedQMS, rowSelectionState: $rowSelectionState },
			id: Math.random().toString(36).substr(2, 9)
		};
		QMSFieldToQMSGetMany_Store.addOrReplaceKeepingOldId(objToAdd);
	}

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
			console.log('aaaaaa', {
				myField,
				myFieldRoot,
				myFieldSubfields
			});
			$QMSRows = $schemaData.queryFields.filter((item) => {
				return item.dd_kindList && item.dd_rootName == myField.dd_rootName;
			});
			console.log({ QMSRows });
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
		//	console.log({ node, QMSRows });
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

<button class="btn btn-xs btn-ghost" on:click={handleClick}
	>{field.dd_displayName}
	{#if field.dd_NON_NULL}
		<sup>
			<i class="text-primary bi bi-asterisk" />
		</sup>
	{/if}
</button>
<SelectQMS bind:showSelectQMSModal />
