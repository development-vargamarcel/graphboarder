<script>
	import { getContext } from 'svelte';
	import SelectModal from './SelectModal.svelte';
	import Fuse from 'fuse.js';
	import Modal from './Modal.svelte';
	import SelectQMS from './SelectQMS.svelte';

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
	export let showSelectModal = false;
	export let rowSelectionState = {};
	export let selectedQMS;
	export let selectedRowsColValues = [];
	export let field;
	export let qmsData;
	//
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const endpointInfo = QMSMainWraperContext?.endpointInfo;
	const schemaData = QMSMainWraperContext?.schemaData;
	//
	const handleClick = () => {
		getPossibleQMS();
		showSelectModal = true;
		console.log({ field, qmsData });
	};
	const fuse = new Fuse($schemaData.queryFields, {
		includeScore: false,
		includeMatches: false,
		threshold: 0.8,
		//ignoreLocation: true,
		keys: ['dd_displayName', 'dd_rootName', 'description']
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
			qmsData = $schemaData.queryFields.filter((item) => {
				return item.dd_kindList && item.dd_rootName == myField.dd_rootName;
			});
			console.log({ qmsData });
			if (qmsData.length == 1) {
				selectedQMS = qmsData[0];

				return;
			}
			if (qmsData.length > 0) {
				return;
			}

			qmsData = fuse
				.search(`${myField.dd_rootName}`)
				.map((item) => item.item)
				.filter((item) => item.dd_kindList);
			if (qmsData.length > 0) {
				return;
			}
		}
		//	console.log({ node, qmsData });
		qmsData = fuse
			.search(
				`${node?.dd_rootName?.replaceAll('_', ' ')} | ${node?.dd_displayName?.replaceAll(
					//!!!node?.dd_displayName?.replaceAll "?" might cause unexpected problems
					'_',
					' '
				)}`
			)
			.map((item) => item.item)
			.filter((item) => item.dd_kindList);
		if (qmsData.length > 0) {
			return;
		}
		qmsData = fuse
			.search(
				`${node.dd_rootName.replaceAll('_', ' ')} | ${node.dd_displayName.replaceAll('_', ' ')}`
			)
			.map((item) => item.item);
		console.log({ node, qmsData });
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
{#if qmsData?.length > 0 && !selectedQMS}
	<!-- content here -->
{/if}
<SelectQMS bind:showSelectModal {qmsData} bind:selectedQMS />
