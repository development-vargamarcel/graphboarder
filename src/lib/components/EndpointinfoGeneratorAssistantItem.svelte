<script>
	import { getContext } from 'svelte';

	export let type;
	export let i;
	export let prefix = '';

	const QMSWraperContext = getContext(`${prefix}QMSWraperContext`);
	let QMSMainWraperContext = getContext(`${prefix}QMSMainWraperContext`);
	const schemaData = QMSMainWraperContext?.schemaData;
</script>

<tr>
	<th>{i + 1}</th>
	<td
		class="cursor-pointer hover:text-primary"
		on:click={() => {
			console.log(type);
		}}
	>
		{type.dd_displayName}</td
	>
	<td
		class="cursor-pointer hover:text-primary"
		on:click={() => {
			console.log(schemaData.get_rootType(null, type.dd_rootName, schemaData));
		}}>{type.dd_rootName}</td
	>
	<td>{type.dd_kindList_NON_NULL ? '!' : ''}</td>
	<td>{type.dd_kindList ? 'list' : ''}</td>
	<td>{type.dd_kindEl_NON_NULL ? '!' : ''}</td>
	<td>{type.dd_kindEl}</td>
</tr>
