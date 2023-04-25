<script>
	export let type;
	export let i;
</script>

<tr>
	<th>{i + 1}</th>
	<td class="break-all"> {type.dd_displayName}</td>
	<td>{type.dd_rootName}</td>
	<td>{type.dd_kindList_NON_NULL ? '!' : ''}</td>
	<td>{type.dd_kindList ? 'list' : ''}</td>
	<td>{type.dd_kindEl_NON_NULL ? '!' : ''}</td>
	<td>{type.dd_kindEl}</td>
</tr>
